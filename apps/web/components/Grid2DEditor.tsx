'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Grid3X3, Copy, Trash2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'

export interface GridEntity {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color: string
  type: 'rect' | 'circle' | 'text'
}

export interface Grid2DEditorProps {
  entities?: GridEntity[]
  onEntitiesChange?: (entities: GridEntity[]) => void
  gridSize?: number
  snapToGrid?: boolean
  showGrid?: boolean
  readonly?: boolean
}

/**
 * 2D Grid/Blueprint Editor
 * 
 * Allows users to see and edit entity positions/sizes in 2D overhead view
 * Perfect for planning layouts before rendering in 3D
 */
export function Grid2DEditor({
  entities: initialEntities = [],
  onEntitiesChange,
  gridSize = 20,
  snapToGrid = true,
  showGrid = true,
  readonly = false,
}: Grid2DEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [entities, setEntities] = useState<GridEntity[]>(initialEntities)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'move' | 'resize' | null>(null)

  // Draw grid and entities
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    // Clear canvas
    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1

      const gridSpacing = gridSize * zoom

      for (let x = panX % gridSpacing; x < canvas.width; x += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      for (let y = panY % gridSpacing; y < canvas.height; y += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }
    }

    // Draw entities
    entities.forEach((entity) => {
      const screenX = entity.x * zoom + panX
      const screenY = entity.y * zoom + panY
      const screenW = entity.width * zoom
      const screenH = entity.height * zoom

      // Draw entity
      ctx.fillStyle = entity.color
      ctx.globalAlpha = selectedId === entity.id ? 1 : 0.7

      if (entity.type === 'rect') {
        ctx.fillRect(screenX, screenY, screenW, screenH)
      } else if (entity.type === 'circle') {
        ctx.beginPath()
        ctx.arc(screenX + screenW / 2, screenY + screenH / 2, screenW / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw selection border
      if (selectedId === entity.id) {
        ctx.globalAlpha = 1
        ctx.strokeStyle = '#a78bfa'
        ctx.lineWidth = 2
        ctx.strokeRect(screenX, screenY, screenW, screenH)

        // Draw resize handles
        const handleSize = 6
        ctx.fillStyle = '#a78bfa'
        ctx.fillRect(screenX + screenW - handleSize / 2, screenY + screenH - handleSize / 2, handleSize, handleSize)
      }

      ctx.globalAlpha = 1
    })

    // Draw center point
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2)
    ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, canvas.height / 2 - 10)
    ctx.lineTo(canvas.width / 2, canvas.height / 2 + 10)
    ctx.stroke()
  }, [entities, selectedId, zoom, panX, panY, showGrid, gridSize])

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readonly) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = (e.clientX - rect.left - panX) / zoom
    const mouseY = (e.clientY - rect.top - panY) / zoom

    // Check if clicking on resize handle
    const selected = entities.find(
      (e) =>
        mouseX >= e.x + e.width - 10 &&
        mouseX <= e.x + e.width + 10 &&
        mouseY >= e.y + e.height - 10 &&
        mouseY <= e.y + e.height + 10
    )

    if (selected && selectedId === selected.id) {
      setDragMode('resize')
      setIsDragging(true)
      return
    }

    // Check if clicking on entity
    const clickedEntity = entities.find(
      (e) => mouseX >= e.x && mouseX <= e.x + e.width && mouseY >= e.y && mouseY <= e.y + e.height
    )

    if (clickedEntity) {
      setSelectedId(clickedEntity.id)
      setDragMode('move')
      setIsDragging(true)
    } else {
      setSelectedId(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedId || readonly) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const deltaX = ((e.movementX / zoom) * 1) / zoom
    const deltaY = ((e.movementY / zoom) * 1) / zoom

    setEntities((prev) =>
      prev.map((entity) => {
        if (entity.id !== selectedId) return entity

        if (dragMode === 'move') {
          let newX = entity.x + deltaX
          let newY = entity.y + deltaY

          if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize
            newY = Math.round(newY / gridSize) * gridSize
          }

          return { ...entity, x: newX, y: newY }
        } else if (dragMode === 'resize') {
          let newW = entity.width + deltaX
          let newH = entity.height + deltaY

          if (snapToGrid) {
            newW = Math.round(newW / gridSize) * gridSize
            newH = Math.round(newH / gridSize) * gridSize
          }

          return { ...entity, width: Math.max(gridSize, newW), height: Math.max(gridSize, newH) }
        }

        return entity
      })
    )
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragMode(null)
    // Notify parent of changes
    onEntitiesChange?.(entities)
  }

  const handleDelete = () => {
    if (!selectedId || readonly) return
    setEntities((prev) => prev.filter((e) => e.id !== selectedId))
    setSelectedId(null)
  }

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom((prev) =>
      direction === 'in' ? Math.min(prev + 0.2, 3) : Math.max(prev - 0.2, 0.5)
    )
  }

  const handleReset = () => {
    setZoom(1)
    setPanX(0)
    setPanY(0)
  }

  const handleAddEntity = () => {
    if (readonly) return
    const newEntity: GridEntity = {
      id: `entity-${Date.now()}`,
      name: `Entity ${entities.length + 1}`,
      x: 100,
      y: 100,
      width: 80,
      height: 60,
      rotation: 0,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      type: 'rect',
    }
    setEntities((prev) => [...prev, newEntity])
    setSelectedId(newEntity.id)
  }

  return (
    <div className="h-full w-full flex flex-col bg-black/50 rounded-lg overflow-hidden border border-white/10">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">2D Blueprint Editor</span>
          <span className="text-xs text-white/50 ml-2">{entities.length} entities</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => handleZoom('out')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-white/70" />
          </button>
          <span className="text-xs text-white/50 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => handleZoom('in')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-white/70" />
          </button>

          {/* Reset view */}
          <button
            onClick={handleReset}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
            title="Reset view"
          >
            <RotateCw className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 w-full h-full cursor-default"
          style={{ cursor: dragMode === 'resize' ? 'nwse-resize' : dragMode === 'move' ? 'grab' : 'default' }}
        />

        {/* Info text */}
        {entities.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm pointer-events-none">
            <div className="text-center">
              <p>No entities yet</p>
              <p className="text-xs mt-1">Click "Add Entity" to start</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer toolbar */}
      <div className="border-t border-white/10 bg-black/60 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedId && (
            <>
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Delete selected entity (Del)"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
              <span className="text-xs text-white/50">
                {entities.find((e) => e.id === selectedId)?.name}
              </span>
            </>
          )}
        </div>

        {!readonly && (
          <button
            onClick={handleAddEntity}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            + Add Entity
          </button>
        )}
      </div>
    </div>
  )
}
