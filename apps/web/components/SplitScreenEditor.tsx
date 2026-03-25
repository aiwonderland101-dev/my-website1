'use client'

import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { Layout, Maximize2, Minimize2 } from 'lucide-react'

export interface SplitScreenEditorProps {
  /**
   * Left panel: typically 2D grid/blueprint editor
   */
  leftPanel: ReactNode
  
  /**
   * Right panel: typically 3D PlayCanvas viewport
   */
  rightPanel: ReactNode
  
  /**
   * Optional middle panel: properties/inspector
   */
  middlePanel?: ReactNode
  
  /**
   * Default split percentage (0-100), where 50 = equal split
   */
  defaultSplit?: number
  
  /**
   * Layout mode: 'horizontal' (left-right) or 'vertical' (top-bottom)
   */
  layoutMode?: 'horizontal' | 'vertical'
  
  /**
   * Show middle inspector panel
   */
  showInspector?: boolean
  
  /**
   * Callback when split position changes
   */
  onSplitChange?: (position: number) => void
  
  /**
   * Enable keyboard shortcuts (Ctrl+\ to toggle)
   */
  enableKeyboardShortcuts?: boolean
}

/**
 * Split-Screen Editor Component
 * 
 * Allows users to view 2D grid and 3D world simultaneously with draggable resizer
 * Perfect for building websites (left panel) while seeing 3D scene (right panel)
 */
export function SplitScreenEditor({
  leftPanel,
  rightPanel,
  middlePanel,
  defaultSplit = 50,
  layoutMode = 'horizontal',
  showInspector = false,
  onSplitChange,
  enableKeyboardShortcuts = true,
}: SplitScreenEditorProps) {
  const [splitPos, setSplitPos] = useState(defaultSplit)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreenLeft, setIsFullscreenLeft] = useState(false)
  const [isFullscreenRight, setIsFullscreenRight] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+\ to toggle split-screen
      if (e.ctrlKey && e.key === '\\') {
        e.preventDefault()
        setSplitPos(prev => prev === 100 ? 50 : 100)
      }
      // Ctrl+Shift+\ to toggle right panel fullscreen
      if (e.ctrlKey && e.shiftKey && e.key === '\\') {
        e.preventDefault()
        setIsFullscreenRight(prev => !prev)
      }
      // Alt+\ to toggle left panel fullscreen
      if (e.altKey && e.key === '\\') {
        e.preventDefault()
        setIsFullscreenLeft(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboardShortcuts])

  // Handle mouse drag on divider
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      let newPos: number

      if (layoutMode === 'horizontal') {
        newPos = ((e.clientX - rect.left) / rect.width) * 100
      } else {
        newPos = ((e.clientY - rect.top) / rect.height) * 100
      }

      // Clamp between 20% and 80%
      newPos = Math.max(20, Math.min(80, newPos))
      setSplitPos(newPos)
      onSplitChange?.(newPos)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, layoutMode, onSplitChange])

  // Handle fullscreen mode
  if (isFullscreenLeft) {
    return (
      <div className="h-full w-full flex flex-col bg-black">
        {/* Header with exit button */}
        <div className="border-b border-white/10 bg-black/80 backdrop-blur px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Layout className="w-4 h-4" />
            <span>2D Editor Fullscreen</span>
          </div>
          <button
            onClick={() => setIsFullscreenLeft(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Exit fullscreen (Alt+\)"
          >
            <Minimize2 className="w-4 h-4 text-white/70" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">{leftPanel}</div>
      </div>
    )
  }

  if (isFullscreenRight) {
    return (
      <div className="h-full w-full flex flex-col bg-black">
        {/* Header with exit button */}
        <div className="border-b border-white/10 bg-black/80 backdrop-blur px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Layout className="w-4 h-4" />
            <span>3D Viewport Fullscreen</span>
          </div>
          <button
            onClick={() => setIsFullscreenRight(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Exit fullscreen (Ctrl+Shift+\)"
          >
            <Minimize2 className="w-4 h-4 text-white/70" />
          </button>
        </div>
        <div className="flex-1 overflow-auto">{rightPanel}</div>
      </div>
    )
  }

  // Horizontal split (left-right)
  if (layoutMode === 'horizontal') {
    return (
      <div
        ref={containerRef}
        className="h-full w-full flex bg-black relative overflow-hidden"
      >
        {/* Left Panel - 2D Grid/Blueprint */}
        <div
          className="flex flex-col border-r border-white/10 bg-black/40 overflow-hidden"
          style={{ width: `${splitPos}%` }}
        >
          <div className="flex-1 overflow-auto">{leftPanel}</div>
        </div>

        {/* Resizer Handle */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className={`w-1 cursor-col-resize transition-colors ${
            isDragging
              ? 'bg-purple-500'
              : 'bg-white/10 hover:bg-purple-500/50'
          }`}
        />

        {/* Right Panel - 3D PlayCanvas */}
        <div
          className="flex flex-col border-l border-white/10 bg-black/20 overflow-hidden relative"
          style={{ width: `${100 - splitPos}%` }}
        >
          <div className="flex-1 overflow-auto">{rightPanel}</div>

          {/* Floating toolbar in 3D viewport */}
          <div className="absolute top-4 right-4 flex gap-2 z-40">
            <button
              onClick={() => setIsFullscreenRight(true)}
              className="p-2 bg-black/60 hover:bg-black/80 border border-white/20 rounded-lg transition-colors"
              title="Fullscreen 3D (Ctrl+Shift+\)"
            >
              <Maximize2 className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="absolute bottom-2 left-2 text-xs text-white/40 pointer-events-none flex gap-3">
          <span>Ctrl+\ to toggle</span>
          <span>Drag divider to resize</span>
        </div>
      </div>
    )
  }

  // Vertical split (top-bottom)
  return (
    <div
      ref={containerRef}
      className="h-full w-full flex flex-col bg-black relative overflow-hidden"
    >
      {/* Top Panel - 2D Grid */}
      <div
        className="flex flex-row border-b border-white/10 bg-black/40 overflow-hidden"
        style={{ height: `${splitPos}%` }}
      >
        <div className="flex-1 overflow-auto">{leftPanel}</div>
      </div>

      {/* Resizer Handle */}
      <div
        onMouseDown={() => setIsDragging(true)}
        className={`h-1 cursor-row-resize transition-colors ${
          isDragging
            ? 'bg-purple-500'
            : 'bg-white/10 hover:bg-purple-500/50'
        }`}
      />

      {/* Bottom Panel - 3D View */}
      <div
        className="flex flex-col border-t border-white/10 bg-black/20 overflow-hidden relative"
        style={{ height: `${100 - splitPos}%` }}
      >
        <div className="flex-1 overflow-auto">{rightPanel}</div>

        {/* Floating toolbar */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-40">
          <button
            onClick={() => setIsFullscreenRight(true)}
            className="p-2 bg-black/60 hover:bg-black/80 border border-white/20 rounded-lg transition-colors"
            title="Fullscreen 3D (Ctrl+Shift+\)"
          >
            <Maximize2 className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-2 left-2 text-xs text-white/40 pointer-events-none flex gap-3">
        <span>Ctrl+\ to toggle</span>
        <span>Drag divider to resize</span>
      </div>
    </div>
  )
}

/**
 * Split-Screen Toggle Component
 * Place this in the header/topbar to toggle split-screen mode
 */
export function SplitScreenToggle({
  isEnabled,
  onToggle,
  layoutMode = 'horizontal'
}: {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
  layoutMode?: 'horizontal' | 'vertical'
}) {
  return (
    <button
      onClick={() => onToggle(!isEnabled)}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
        isEnabled
          ? 'bg-purple-600/20 border-purple-500/50 text-purple-300 hover:bg-purple-600/30'
          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
      }`}
      title={`Toggle split-screen (${layoutMode === 'horizontal' ? 'left-right' : 'top-bottom'})`}
    >
      <Layout className="w-4 h-4" />
      <span className="text-sm font-medium">
        Split {layoutMode === 'horizontal' ? 'View' : 'Vertical'}
      </span>
      {isEnabled && <span className="text-xs flex items-center gap-1">✓</span>}
    </button>
  )
}
