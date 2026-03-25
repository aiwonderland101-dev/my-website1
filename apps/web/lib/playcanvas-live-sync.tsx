'use client'

import React, { useEffect, useRef, useState } from 'react'

interface EntityChange {
  entityId: string
  entityName: string
  attribute: string
  oldValue: any
  newValue: any
  timestamp: number
}

interface TransformData {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
}

/**
 * Manages real-time synchronization between PlayCanvas 3D scene and code editor
 * 
 * When 3D objects are transformed:
 * - Changes are detected and sent via postMessage
 * - Code editor side-panel shows live updates
 * - scene.json is automatically updated
 */
export class PlayCanvasLiveSync {
  private static instance: PlayCanvasLiveSync
  private listeners: Set<(change: EntityChange) => void> = new Set()
  private entityCache: Map<string, any> = new Map()
  private sceneJson: any = {}

  private constructor() {}

  static getInstance(): PlayCanvasLiveSync {
    if (!PlayCanvasLiveSync.instance) {
      PlayCanvasLiveSync.instance = new PlayCanvasLiveSync()
    }
    return PlayCanvasLiveSync.instance
  }

  /**
   * Initialize listener for PlayCanvas iframe messages
   */
  initializeFromPlayCanvas() {
    window.addEventListener('message', (event) => {
      // Only accept messages from trusted PlayCanvas domain
      if (!event.origin.includes('playcanvas')) return

      if (event.data.type === 'SYNC_TO_CODE') {
        const { id, data, name } = event.data
        this.onEntityChange(id, name, data)
      }

      if (event.data.type === 'SCENE_SNAPSHOT') {
        this.sceneJson = event.data.scene
      }
    })
  }

  /**
   * Send initialization message to PlayCanvas iframe
   * This tells the engine to start listening for changes
   */
  setupPlayCanvasListener() {
    const iframe = document.querySelector(
      'iframe[src*="playcanvas"]'
    ) as HTMLIFrameElement | null

    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'SETUP_SYNC_LISTENER',
          config: {
            syncAttributes: [
              'localPosition',
              'localRotation',
              'localScale',
              'name',
            ],
            debounceMs: 100,
          },
        },
        '*'
      )
    }
  }

  /**
   * Called when an entity attribute changes in PlayCanvas
   */
  private onEntityChange(entityId: string, entityName: string, data: any) {
    // Cache entity data
    this.entityCache.set(entityId, data)

    // Parse transform data
    const transformData = this.parseTransformData(data)

    const change: EntityChange = {
      entityId,
      entityName,
      attribute: Object.keys(data)[0] || 'unknown',
      oldValue: null,
      newValue: data,
      timestamp: Date.now(),
    }

    // Update scene.json structure
    this.updateSceneJson(entityId, entityName, transformData)

    // Notify listeners
    this.notifyListeners(change)
  }

  private parseTransformData(data: any): TransformData | null {
    if (data.localPosition || data.localRotation || data.localScale) {
      return {
        position: data.localPosition || { x: 0, y: 0, z: 0 },
        rotation: data.localRotation || { x: 0, y: 0, z: 0 },
        scale: data.localScale || { x: 1, y: 1, z: 1 },
      }
    }
    return null
  }

  private updateSceneJson(
    entityId: string,
    entityName: string,
    transform: TransformData | null
  ) {
    if (!this.sceneJson.entities) {
      this.sceneJson.entities = []
    }

    let entity = this.sceneJson.entities.find((e: any) => e.id === entityId)

    if (!entity) {
      entity = {
        id: entityId,
        name: entityName,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      }
      this.sceneJson.entities.push(entity)
    }

    if (transform) {
      entity.position = transform.position
      entity.rotation = transform.rotation
      entity.scale = transform.scale
    }
  }

  subscribe(callback: (change: EntityChange) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(change: EntityChange) {
    this.listeners.forEach((cb) => cb(change))
  }

  getSceneJson() {
    return this.sceneJson
  }

  getEntityData(entityId: string) {
    return this.entityCache.get(entityId)
  }
}

/**
 * React hook to use live sync in components
 */
export function usePlayCanvasLiveSync() {
  const [latestChange, setLatestChange] = useState<EntityChange | null>(null)
  const [sceneJson, setSceneJson] = useState<any>({})
  const sync = useRef(PlayCanvasLiveSync.getInstance())

  useEffect(() => {
    // Initialize sync listener
    sync.current.initializeFromPlayCanvas()
    sync.current.setupPlayCanvasListener()

    // Subscribe to changes
    const unsubscribe = sync.current.subscribe((change) => {
      setLatestChange(change)
      setSceneJson(sync.current.getSceneJson())
    })

    return unsubscribe
  }, [])

  return { latestChange, sceneJson, sync: sync.current }
}

/**
 * Side-panel component showing live sync details
 */
interface LiveSyncPanelProps {
  show?: boolean
}

export function LiveSyncPanel({ show = true }: LiveSyncPanelProps) {
  const { latestChange, sceneJson } = usePlayCanvasLiveSync()

  if (!show || !latestChange) {
    return (
      <div className="p-4 text-xs text-gray-500">
        <p>👁️ Watching for 3D changes...</p>
        <p className="mt-2 text-green-600">● Live Sync Active</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3 text-xs font-mono overflow-y-auto max-h-64">
      <div className="bg-blue-50 p-2 rounded border border-blue-200">
        <p className="font-semibold text-blue-900">🔄 Live Change</p>
        <p className="text-blue-700 mt-1">{latestChange.entityName}</p>
        <p className="text-blue-600 mt-1">
          {latestChange.attribute}: {JSON.stringify(latestChange.newValue).substring(0, 50)}...
        </p>
        <p className="text-blue-500 mt-1">
          {new Date(latestChange.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {sceneJson.entities && sceneJson.entities.length > 0 && (
        <div className="bg-gray-50 p-2 rounded border border-gray-200">
          <p className="font-semibold text-gray-900">📦 Scene Entities</p>
          <div className="mt-2 space-y-1">
            {sceneJson.entities.slice(0, 5).map((entity: any) => (
              <div key={entity.id} className="text-gray-700">
                <p className="font-medium">{entity.name}</p>
                <p className="text-gray-600 text-xs ml-2">
                  pos: ({entity.position?.x?.toFixed(2)}, {entity.position?.y?.toFixed(2)},
                  {entity.position?.z?.toFixed(2)})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
