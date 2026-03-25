'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import { APIUsageTracker } from '@/lib/api-usage-tracker'
import { Providers } from 'engine/core/ai/providers'

interface GhostTextSuggestion {
  text: string
  startLine: number
  startColumn: number
  confidence: number
}

const DEBOUNCE_MS = 800

export class GhostTextPredictor {
  private static instance: GhostTextPredictor
  private debounceTimer: NodeJS.Timeout | null = null
  private lastContext: string = ''
  private listeners: Set<(suggestion: GhostTextSuggestion | null) => void> = new Set()
  private isLoading = false

  private constructor() {}

  static getInstance(): GhostTextPredictor {
    if (!GhostTextPredictor.instance) {
      GhostTextPredictor.instance = new GhostTextPredictor()
    }
    return GhostTextPredictor.instance
  }

  /**
   * Called when code editor content changes
   * Debounces requests and sends last 20 lines to AI
   */
  async onCodeChange(
    fullCode: string,
    cursorLine: number,
    cursorColumn: number,
    fileName: string,
    language: string = 'typescript'
  ) {
    // Debounce
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(
      () => this.predictNext(fullCode, cursorLine, cursorColumn, fileName, language),
      DEBOUNCE_MS
    )
  }

  private async predictNext(
    fullCode: string,
    cursorLine: number,
    cursorColumn: number,
    fileName: string,
    language: string
  ) {
    if (this.isLoading) return

    try {
      this.isLoading = true

      // Get last 20 lines of context
      const lines = fullCode.split('\n')
      const startLine = Math.max(0, cursorLine - 20)
      const contextLines = lines.slice(startLine, cursorLine + 1)
      const context = contextLines.join('\n')

      // Skip if context is empty or unchanged
      if (!context.trim() || context === this.lastContext) {
        this.isLoading = false
        return
      }

      this.lastContext = context

      // Call AI to get prediction
      const prompt = `You are a code completion assistant. Given this code context and cursor position, predict the next 1-3 lines of code that the developer will type.

File: ${fileName} (${language})
Cursor at line ${cursorLine + 1}, column ${cursorColumn}

Code context:
\`\`\`${language}
${context}
\`\`\`

Generate ONLY the next 1-3 lines of code that would logically follow. No explanations, no markdown, just raw code. Be concise and match the indentation style.`

      const response = await Providers.openrouter.generate(
        prompt,
        { model: 'gemini-2.0-flash' }
      )

      const suggestedCode = response.content
        ?.toString()
        .trim()
        .split('\n')
        .slice(0, 3)
        .join('\n')

      if (suggestedCode) {
        const suggestion: GhostTextSuggestion = {
          text: suggestedCode,
          startLine: cursorLine,
          startColumn: cursorColumn,
          confidence: 0.85,
        }

        // Record API usage
        APIUsageTracker.getInstance().recordUsage(
          'gemini-2.0-flash',
          Math.ceil(prompt.length / 4),
          Math.ceil(suggestedCode.length / 4),
          'openrouter'
        )

        this.notifyListeners(suggestion)
      }
    } catch (error) {
      console.warn('[GhostText] Prediction failed:', error)
      this.notifyListeners(null)
    } finally {
      this.isLoading = false
    }
  }

  subscribe(
    callback: (suggestion: GhostTextSuggestion | null) => void
  ): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(suggestion: GhostTextSuggestion | null) {
    this.listeners.forEach((cb) => cb(suggestion))
  }

  clear() {
    this.notifyListeners(null)
  }
}

interface GhostTextOverlayProps {
  cursorTop: number
  cursorLeft: number
  suggestion: GhostTextSuggestion | null
  onAccept: (text: string) => void
}

export function GhostTextOverlay({
  cursorTop,
  cursorLeft,
  suggestion,
  onAccept,
}: GhostTextOverlayProps) {
  useEffect(() => {
    if (!suggestion) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        onAccept(suggestion.text)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [suggestion, onAccept])

  if (!suggestion) return null

  return (
    <div
      className="fixed pointer-events-none font-mono text-sm"
      style={{
        top: `${cursorTop}px`,
        left: `${cursorLeft}px`,
        color: 'rgba(100, 200, 100, 0.4)',
        textShadow: '0 0 10px rgba(100, 200, 100, 0.1)',
        whiteSpace: 'pre',
        zIndex: 50,
      }}
    >
      {suggestion.text}
    </div>
  )
}

/**
 * Hook to integrate ghost text into editor
 * Usage in Theia or Monaco editor:
 * 
 * const { suggestion, onCodeChange, onAccept } = useGhostText();
 * editor.onDidChangeModelContent(() => {
 *   const position = editor.getPosition();
 *   onCodeChange(editor.getValue(), position.lineNumber - 1, position.column - 1);
 * });
 */
export function useGhostText() {
  const [suggestion, setSuggestion] = useState<GhostTextSuggestion | null>(null)
  const predictor = useRef(GhostTextPredictor.getInstance())

  useEffect(() => {
    const unsubscribe = predictor.current.subscribe(setSuggestion)
    return unsubscribe
  }, [])

  const onCodeChange = useCallback(
    (code: string, line: number, column: number, fileName = 'file.ts') => {
      predictor.current.onCodeChange(code, line, column, fileName)
    },
    []
  )

  const onAccept = useCallback((text: string) => {
    predictor.current.clear()
  }, [])

  return { suggestion, onCodeChange, onAccept }
}
