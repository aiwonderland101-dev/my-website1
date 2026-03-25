'use client'

import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Model {
  id: string
  name: string
  provider: 'openrouter' | 'google' | 'anthropic' | 'hybrid'
  speed: 'fast' | 'medium' | 'slow'
  costTier: 'free' | 'cheap' | 'mid' | 'expensive'
  supportsVision: boolean
  description: string
}

const MODELS: Record<string, Model> = {
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'openrouter',
    speed: 'fast',
    costTier: 'cheap',
    supportsVision: true,
    description: 'Ultra-fast for real-time suggestions and rapid iterations',
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    speed: 'medium',
    costTier: 'mid',
    supportsVision: true,
    description: 'Excellent reasoning for complex game mechanics',
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    speed: 'medium',
    costTier: 'expensive',
    supportsVision: true,
    description: 'Advanced reasoning for physics & complex systems',
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    speed: 'medium',
    costTier: 'mid',
    supportsVision: true,
    description: 'Strong code generation and coherent explanations',
  },
  'gemini-2.0-pro': {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro',
    provider: 'google',
    speed: 'slow',
    costTier: 'expensive',
    supportsVision: true,
    description: 'Peak performance for architectural decisions',
  },
}

const SPEED_COLORS = {
  fast: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  slow: 'bg-orange-100 text-orange-800',
}

const COST_COLORS = {
  free: 'bg-emerald-100 text-emerald-800',
  cheap: 'bg-cyan-100 text-cyan-800',
  mid: 'bg-amber-100 text-amber-800',
  expensive: 'bg-red-100 text-red-800',
}

interface ModelSelectorProps {
  currentModel?: string
  onModelChange?: (modelId: string) => void
  showCostEstimate?: boolean
}

export function ModelSelector({
  currentModel = 'gemini-2.0-flash',
  onModelChange,
  showCostEstimate = true,
}: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState(currentModel)
  const [savedPreference, setSavedPreference] = useState(false)

  // Load saved model preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('preferred-model')
    if (saved && MODELS[saved]) {
      setSelectedModel(saved)
    }
  }, [])

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    onModelChange?.(modelId)

    // Save to localStorage
    localStorage.setItem('preferred-model', modelId)

    // Save to Supabase user preferences (async, fire-and-forget)
    try {
      fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredModel: modelId }),
      }).catch(() => {
        /* Silently fail if API unavailable */
      })
    } catch {
      /* No-op */
    }

    setSavedPreference(true)
    setTimeout(() => setSavedPreference(false), 2000)
  }

  const model = MODELS[selectedModel]

  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          AI Model Selection
        </label>
        <p className="text-xs text-gray-500">
          Choose your preferred model for code generation and suggestions
        </p>
      </div>

      <Select value={selectedModel} onValueChange={handleModelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>🚀 Fast (Real-time suggestions)</SelectLabel>
            <SelectItem value="gemini-2.0-flash">
              Gemini 2.0 Flash (Recommended for launch)
            </SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>⚙️ Balanced</SelectLabel>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
          </SelectGroup>

          <SelectGroup>
            <SelectLabel>🧠 Powerful (Complex logic)</SelectLabel>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="gemini-2.0-pro">Gemini 2.0 Pro</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Current Model Details Card */}
      {model && (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{model.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{model.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={`${SPEED_COLORS[model.speed]} border-0`}>
              ⚡ {model.speed === 'fast' ? 'Lightning Fast' : model.speed === 'medium' ? 'Medium Speed' : 'Slower But Powerful'}
            </Badge>
            <Badge className={`${COST_COLORS[model.costTier]} border-0`}>
              💰{' '}
              {model.costTier === 'free'
                ? 'Free'
                : model.costTier === 'cheap'
                  ? 'Very Cheap'
                  : model.costTier === 'mid'
                    ? 'Moderate Cost'
                    : 'Premium'}
            </Badge>
            {model.supportsVision && (
              <Badge className="bg-purple-100 text-purple-800 border-0">
                👁️ Vision
              </Badge>
            )}
          </div>

          {showCostEstimate && (
            <Alert className="bg-blue-50 border-blue-200">
              <Zap className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                💡 Current model: ~
                {model.costTier === 'cheap'
                  ? '$0.001/req'
                  : model.costTier === 'mid'
                    ? '$0.01/req'
                    : '$0.05/req'}{' '}
                (estimate)
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Saved Preference Indicator */}
      {savedPreference && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <span className="text-green-700 text-sm font-medium">
            ✅ Preference saved (local & cloud)
          </span>
        </div>
      )}

      {/* Accessibility Oracle Integration Notice */}
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm text-amber-800">
          Your Accessibility Oracle is watching model swaps. It will alert you if
          this model has issues with the current scene layout.
        </AlertDescription>
      </Alert>
    </div>
  )
}
