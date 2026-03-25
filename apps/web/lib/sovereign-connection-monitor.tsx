'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Wifi, WifiOff, Zap } from 'lucide-react'

type ConnectionStatus = 'connected' | 'offline' | 'loading' | 'error' | 'expired'

interface ConnectionState {
  supabaseConnected: boolean
  githubConnected: boolean
  tokenExpired: boolean
  byocHealthy: boolean
  lastChecked: number
}

/**
 * Monitors connection status to Supabase, GitHub, and BYOC services
 */
export class SovereignConnectionMonitor {
  private static instance: SovereignConnectionMonitor
  private listeners: Set<(status: ConnectionState) => void> = new Set()
  private checkInterval: NodeJS.Timeout | null = null
  private lastState: ConnectionState = {
    supabaseConnected: false,
    githubConnected: false,
    tokenExpired: false,
    byocHealthy: false,
    lastChecked: 0,
  }

  private constructor() {}

  static getInstance(): SovereignConnectionMonitor {
    if (!SovereignConnectionMonitor.instance) {
      SovereignConnectionMonitor.instance = new SovereignConnectionMonitor()
    }
    return SovereignConnectionMonitor.instance
  }

  /**
   * Start monitoring connections
   */
  start() {
    this.checkConnections()

    // Check every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkConnections()
    }, 30000)
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
  }

  private async checkConnections() {
    try {
      const response = await fetch('/api/permissions/status', {
        method: 'GET',
      })

      if (!response.ok) {
        if (response.status === 401) {
          this.lastState.tokenExpired = true
        }
        throw new Error(`Status ${response.status}`)
      }

      const data = await response.json()

      this.lastState = {
        supabaseConnected:
          data.permissions?.some(
            (p: any) => p.name === 'Supabase Connection' && p.status === 'connected'
          ) ?? false,
        githubConnected:
          data.permissions?.some(
            (p: any) => p.name === 'GitHub Integration' && p.status === 'connected'
          ) ?? false,
        byocHealthy:
          data.permissions?.some(
            (p: any) => p.name === 'BYOC Cloud Access' && p.status === 'connected'
          ) ?? false,
        tokenExpired: false,
        lastChecked: Date.now(),
      }

      this.notifyListeners(this.lastState)
    } catch (error) {
      console.warn('[SovereignMonitor] Connection check failed:', error)

      // If failure, mark as potentially offline
      this.lastState = {
        ...this.lastState,
        supabaseConnected: false,
        lastChecked: Date.now(),
      }

      this.notifyListeners(this.lastState)
    }
  }

  subscribe(callback: (state: ConnectionState) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(state: ConnectionState) {
    this.listeners.forEach((cb) => cb(state))
  }

  getStatus(): ConnectionState {
    return this.lastState
  }

  getDerivedStatus(): ConnectionStatus {
    if (this.lastState.tokenExpired) return 'expired'
    if (!this.lastState.supabaseConnected && !this.lastState.byocHealthy)
      return 'offline'
    if (this.lastState.supabaseConnected && this.lastState.byocHealthy)
      return 'connected'
    return 'loading'
  }
}

/**
 * React hook for connection status
 */
export function useSovereignConnection() {
  const [state, setState] = useState<ConnectionState>({
    supabaseConnected: false,
    githubConnected: false,
    tokenExpired: false,
    byocHealthy: false,
    lastChecked: 0,
  })
  const monitor = React.useRef(SovereignConnectionMonitor.getInstance())

  useEffect(() => {
    monitor.current.start()

    const unsubscribe = monitor.current.subscribe(setState)

    return () => {
      unsubscribe()
      monitor.current.stop()
    }
  }, [])

  const derivedStatus = monitor.current.getDerivedStatus()

  return { state, derivedStatus, monitor: monitor.current }
}

/**
 * Connection Status Indicator (Top right corner)
 * Shows pulse icon indicating connection state
 */
interface ConnectionIndicatorProps {
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export function ConnectionStatusIndicator({
  size = 'md',
  showTooltip = true,
}: ConnectionIndicatorProps) {
  const { state, derivedStatus } = useSovereignConnection()
  const [showDetails, setShowDetails] = useState(false)

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  }

  const pulseColor = {
    connected: 'bg-green-500',
    offline: 'bg-yellow-500',
    expired: 'bg-red-500',
    loading: 'bg-gray-400',
    error: 'bg-red-600',
  }

  const statusLabel = {
    connected: 'Connected',
    offline: 'Offline / Local',
    expired: 'Token Expired',
    loading: 'Checking...',
    error: 'Connection Error',
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        title={statusLabel[derivedStatus]}
      >
        {/* Animated pulse */}
        <div className={`relative ${sizeClasses[size]}`}>
          <div
            className={`absolute inset-0 rounded-full ${pulseColor[derivedStatus]} animate-pulse`}
          />
          <div
            className={`absolute inset-0 rounded-full ${pulseColor[derivedStatus]} opacity-30`}
          />
        </div>

        {size !== 'sm' && (
          <span className="text-xs font-medium text-gray-700">
            {derivedStatus === 'connected' ? '●' : derivedStatus === 'offline' ? '◐' : '○'}{' '}
            {statusLabel[derivedStatus]}
          </span>
        )}
      </button>

      {/* Details Popover */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-72">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm text-gray-900">Connection Status</h3>
              <p className="text-xs text-gray-600 mt-1">
                Your data and services integration status
              </p>
            </div>

            {/* Status Items */}
            <div className="space-y-2">
              {/* Supabase */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">🗄️ Supabase</span>
                <Badge
                  className={
                    state.supabaseConnected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {state.supabaseConnected ? 'Connected' : 'Offline'}
                </Badge>
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">🐙 GitHub</span>
                <Badge
                  className={
                    state.githubConnected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {state.githubConnected ? 'Connected' : 'Not linked'}
                </Badge>
              </div>

              {/* BYOC */}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">☁️ BYOC Cloud</span>
                <Badge
                  className={
                    state.byocHealthy
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }
                >
                  {state.byocHealthy ? 'Ready' : 'Not configured'}
                </Badge>
              </div>
            </div>

            {/* Token Expired Warning */}
            {state.tokenExpired && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      Token Expired
                    </p>
                    <p className="text-xs text-red-800 mt-1">
                      Please re-authenticate to continue
                    </p>
                    <button className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                      Re-authenticate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Last Checked */}
            <div className="text-xs text-gray-500 border-t pt-2">
              Last checked:{' '}
              {state.lastChecked
                ? new Date(state.lastChecked).toLocaleTimeString()
                : 'Never'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Full-page redirect for expired tokens
 */
export function TokenExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Session Expired
        </h1>
        <p className="text-gray-600 mb-6">
          Your authentication token has expired. Please log in again to continue
          using WonderSpace IDE.
        </p>

        <div className="space-y-2">
          <a
            href="/auth/login"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Re-authenticate
          </a>
          <a
            href="/"
            className="block w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
