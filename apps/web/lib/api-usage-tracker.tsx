'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Zap, TrendingUp } from 'lucide-react'

interface CostEntry {
  timestamp: number
  model: string
  inputTokens: number
  outputTokens: number
  costUSD: number
  provider: string
}

interface CostStats {
  totalCost: number
  totalRequests: number
  averageCostPerRequest: number
  costByModel: Record<string, number>
  costByProvider: Record<string, number>
  costTrend: Array<{ time: string; cost: number }>
}

const TOKEN_PRICES: Record<string, { input: number; output: number }> = {
  'gemini-2.0-flash': { input: 0.00005, output: 0.00015 },
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'claude-3-5-sonnet': { input: 0.003, output: 0.015 },
  'gemini-2.0-pro': { input: 0.00075, output: 0.003 },
}

const COLORS = ['#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981']

export class APIUsageTracker {
  private static instance: APIUsageTracker
  private entries: CostEntry[] = []
  private listeners: Set<() => void> = new Set()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): APIUsageTracker {
    if (!APIUsageTracker.instance) {
      APIUsageTracker.instance = new APIUsageTracker()
    }
    return APIUsageTracker.instance
  }

  recordUsage(
    model: string,
    inputTokens: number,
    outputTokens: number,
    provider: string = 'openrouter'
  ) {
    const prices = TOKEN_PRICES[model] || { input: 0.001, output: 0.001 }
    const costUSD = inputTokens * prices.input + outputTokens * prices.output

    const entry: CostEntry = {
      timestamp: Date.now(),
      model,
      inputTokens,
      outputTokens,
      costUSD,
      provider,
    }

    this.entries.push(entry)
    this.saveToStorage()
    this.notifyListeners()

    // Log cost to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[APIUsage] ${model}: $${costUSD.toFixed(4)}`)
    }

    // Fire-and-forget: Save to Supabase
    this.syncToSupabase(entry)
  }

  private async syncToSupabase(entry: CostEntry) {
    try {
      await fetch('/api/usage/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      console.warn('[APIUsage] Failed to sync to Supabase:', error)
    }
  }

  getStats(): CostStats {
    const costByModel: Record<string, number> = {}
    const costByProvider: Record<string, number> = {}
    let totalCost = 0

    this.entries.forEach((entry) => {
      costByModel[entry.model] = (costByModel[entry.model] || 0) + entry.costUSD
      costByProvider[entry.provider] =
        (costByProvider[entry.provider] || 0) + entry.costUSD
      totalCost += entry.costUSD
    })

    // Calculate hourly cost trend
    const now = Date.now()
    const last24h = now - 24 * 60 * 60 * 1000
    const hourlyData: Record<number, number> = {}

    this.entries
      .filter((e) => e.timestamp > last24h)
      .forEach((entry) => {
        const hour = Math.floor(entry.timestamp / (60 * 60 * 1000)) * 60
        hourlyData[hour] = (hourlyData[hour] || 0) + entry.costUSD
      })

    const costTrend = Object.entries(hourlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, cost]) => ({
        time: new Date(parseInt(time) * 1000).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        cost: parseFloat(cost.toFixed(4)),
      }))

    return {
      totalCost: parseFloat(totalCost.toFixed(4)),
      totalRequests: this.entries.length,
      averageCostPerRequest:
        this.entries.length > 0
          ? parseFloat((totalCost / this.entries.length).toFixed(6))
          : 0,
      costByModel,
      costByProvider,
      costTrend,
    }
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb())
  }

  private saveToStorage() {
    try {
      localStorage.setItem('api-usage-tracking', JSON.stringify(this.entries))
    } catch {
      // Quota exceeded
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('api-usage-tracking')
      if (stored) {
        this.entries = JSON.parse(stored)
      }
    } catch {
      // Ignore parse errors
    }
  }

  resetStats() {
    this.entries = []
    this.saveToStorage()
    this.notifyListeners()
  }
}

interface APIUsagePanelProps {
  compact?: boolean
}

export function APIUsagePanel({ compact = false }: APIUsagePanelProps) {
  const [stats, setStats] = useState<CostStats | null>(null)
  const tracker = APIUsageTracker.getInstance()

  useEffect(() => {
    setStats(tracker.getStats())
    const unsubscribe = tracker.subscribe(() => {
      setStats(tracker.getStats())
    })
    return unsubscribe
  }, [tracker])

  if (!stats) return null

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <DollarSign className="h-4 w-4 text-blue-600" />
        <div className="text-sm">
          <div className="font-semibold text-blue-900">
            ${stats.totalCost.toFixed(2)} spent
          </div>
          <div className="text-xs text-blue-700">
            {stats.totalRequests} requests • ${stats.averageCostPerRequest.toFixed(4)}/req
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          API Usage & Cost Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cost Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm font-semibold text-green-700">Total Cost</div>
            <div className="text-2xl font-bold text-green-900">
              ${stats.totalCost.toFixed(2)}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-semibold text-blue-700">Requests</div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.totalRequests}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm font-semibold text-purple-700">Avg Cost</div>
            <div className="text-2xl font-bold text-purple-900">
              ${stats.averageCostPerRequest.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Cost Trend Chart */}
        {stats.costTrend.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Cost Trend (24h)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.costTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(4)}`}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 gap-6">
          {/* By Model */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Cost by Model</h3>
            {Object.entries(stats.costByModel).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.costByModel)
                  .sort(([, a], [, b]) => b - a)
                  .map(([model, cost], idx) => (
                    <div key={model} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{model}</span>
                      <Badge className={`bg-${['sky', 'amber', 'red', 'purple', 'emerald'][idx % 5]}-100 text-${['sky', 'amber', 'red', 'purple', 'emerald'][idx % 5]}-800 border-0`}>
                        ${cost.toFixed(3)}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No usage yet</p>
            )}
          </div>

          {/* By Provider */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Cost by Provider</h3>
            {Object.entries(stats.costByProvider).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.costByProvider)
                  .sort(([, a], [, b]) => b - a)
                  .map(([provider, cost], idx) => (
                    <div
                      key={provider}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600 capitalize">
                        {provider}
                      </span>
                      <Badge className={`bg-${['sky', 'amber', 'red'][idx % 3]}-100 text-${['sky', 'amber', 'red'][idx % 3]}-800 border-0`}>
                        ${cost.toFixed(3)}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No usage yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
