'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Download, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Asset {
  id: string
  name: string
  description: string
  category: 'model' | 'texture' | 'prefab' | 'material'
  fileUrl: string
  fileType: 'glb' | 'gltf' | 'jpg' | 'png' | 'webp'
  fileSize: number
  previewUrl?: string
  price: number
  rating: number
  creator: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * PlayCanvas API integration for asset injection
 * Allows adding purchased assets directly to user's PlayCanvas project
 *
 * Uses PlayCanvas REST API:
 * POST /api/projects/{projectId}/assets
 */
export class PlayCanvasAssetStore {
  private static instance: PlayCanvasAssetStore
  private playCanvasProjectId: string = ''
  private playCanvasToken: string = ''
  private assets: Asset[] = []
  private purchasedAssets: Set<string> = new Set()
  private listeners: Set<() => void> = new Set()

  private constructor() {}

  static getInstance(): PlayCanvasAssetStore {
    if (!PlayCanvasAssetStore.instance) {
      PlayCanvasAssetStore.instance = new PlayCanvasAssetStore()
    }
    return PlayCanvasAssetStore.instance
  }

  /**
   * Initialize with PlayCanvas credentials
   * Get token from user's BYOC settings
   */
  async initialize(projectId: string, token: string) {
    this.playCanvasProjectId = projectId
    this.playCanvasToken = token
    await this.loadAssets()
  }

  /**
   * Load available assets from store
   */
  private async loadAssets() {
    try {
      const response = await fetch('/api/assets/store')
      if (!response.ok) throw new Error('Failed to load assets')

      const data = await response.json()
      this.assets = data.assets || []
      this.notifyListeners()
    } catch (error) {
      console.error('[AssetStore] Failed to load assets:', error)
    }
  }

  /**
   * Purchase and inject asset into PlayCanvas project
   * This is the critical "World Class" feature
   */
  async purchaseAndInjectAsset(asset: Asset): Promise<ApiResponse<any>> {
    try {
      // Step 1: Mark as purchased in our database
      const purchaseResponse = await fetch('/api/assets/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          projectId: this.playCanvasProjectId,
        }),
      })

      if (!purchaseResponse.ok) {
        throw new Error('Purchase failed')
      }

      this.purchasedAssets.add(asset.id)

      // Step 2: Upload asset to user's Supabase bucket
      const uploadResponse = await fetch('/api/assets/upload-to-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetUrl: asset.fileUrl,
          fileName: asset.name,
          projectId: this.playCanvasProjectId,
        }),
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const uploadData = await uploadResponse.json()
      const uploadedUrl = uploadData.publicUrl

      // Step 3: Inject into PlayCanvas project via REST API
      const injectResponse = await fetch(
        `/api/playcanvas/projects/${this.playCanvasProjectId}/assets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.playCanvasToken}`,
          },
          body: JSON.stringify({
            name: asset.name,
            source: 'contract', // Indicates purchased asset
            type: this.mapAssetType(asset.category),
            meta: {
              url: uploadedUrl,
              size: asset.fileSize,
              creator: asset.creator,
              purchaseId: `${this.playCanvasProjectId}-${asset.id}`,
            },
          }),
        }
      )

      if (!injectResponse.ok) {
        throw new Error('Failed to inject into PlayCanvas')
      }

      const injectData = await injectResponse.json()

      // Step 4: Trigger refresh in 3D editor so asset appears immediately
      await this.refreshPlayCanvasAssets()

      this.notifyListeners()

      return {
        success: true,
        data: injectData,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        success: false,
        error: message,
      }
    }
  }

  /**
   * Notify PlayCanvas iframe to refresh its assets panel
   */
  private async refreshPlayCanvasAssets() {
    const iframe = document.querySelector(
      'iframe[src*="playcanvas"]'
    ) as HTMLIFrameElement | null

    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'REFRESH_ASSETS',
          projectId: this.playCanvasProjectId,
        },
        '*'
      )
    }
  }

  private mapAssetType(
    category: string
  ): 'model' | 'texture' | 'material' | 'prefab' {
    return (category as any) || 'model'
  }

  /**
   * Get all available assets
   */
  getAssets(): Asset[] {
    return this.assets
  }

  /**
   * Check if asset was purchased
   */
  isPurchased(assetId: string): boolean {
    return this.purchasedAssets.has(assetId)
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb())
  }
}

/**
 * React hook for asset store
 */
export function usePlayCanvasAssetStore(projectId?: string) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [injecting, setInjecting] = useState(false)
  const [injectionResult, setInjectionResult] = useState<ApiResponse<any> | null>(null)

  const store = React.useRef(PlayCanvasAssetStore.getInstance())

  useEffect(() => {
    setLoading(true)
    store.current
      .initialize(projectId || '', '')
      .then(() => {
        setAssets(store.current.getAssets())
      })
      .finally(() => setLoading(false))

    const unsubscribe = store.current.subscribe(() => {
      setAssets(store.current.getAssets())
    })

    return unsubscribe
  }, [projectId])

  const injectAsset = useCallback(
    async (asset: Asset) => {
      setInjecting(true)
      setSelectedAsset(asset)

      const result = await store.current.purchaseAndInjectAsset(asset)
      setInjectionResult(result)
      setInjecting(false)

      if (result.success) {
        // Auto-dismiss after 3 seconds
        setTimeout(() => setInjectionResult(null), 3000)
      }
    },
    []
  )

  return {
    assets,
    loading,
    selectedAsset,
    injecting,
    injectionResult,
    injectAsset,
    isPurchased: (id: string) => store.current.isPurchased(id),
  }
}

/**
 * Asset Store UI Component
 */
interface AssetStoreProps {
  projectId: string
  compact?: boolean
}

export function AssetStorePanel({ projectId, compact }: AssetStoreProps) {
  const {
    assets,
    loading,
    selectedAsset,
    injecting,
    injectionResult,
    injectAsset,
    isPurchased,
  } = usePlayCanvasAssetStore(projectId)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {assets.slice(0, 4).map((asset) => (
          <button
            key={asset.id}
            onClick={() => injectAsset(asset)}
            disabled={isPurchased(asset.id) || injecting}
            className="p-3 border rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <p className="text-sm font-medium truncate">{asset.name}</p>
            <p className="text-xs text-gray-500">${asset.price}</p>
          </button>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Asset Store (for PlayCanvas)
        </CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          Purchase and instantly inject assets into your scene
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Injection Result Toast */}
        {injectionResult && (
          <Alert
            className={
              injectionResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }
          >
            <div className="flex items-start gap-2">
              {injectionResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {injectionResult.success
                    ? `${selectedAsset?.name || 'Asset'} injected! ✨`
                    : 'Injection failed'}
                </p>
                {injectionResult.error && (
                  <p className="text-xs mt-1">{injectionResult.error}</p>
                )}
                {injectionResult.success && (
                  <p className="text-xs mt-1">Check your PlayCanvas Assets panel</p>
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Asset Grid */}
        <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
          {assets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No assets available</p>
            </div>
          ) : (
            assets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{asset.name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {asset.description}
                    </p>
                  </div>
                  <Badge className="ml-2 whitespace-nowrap">
                    {asset.category}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                  <span>⭐ {asset.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>by {asset.creator}</span>
                  <span>•</span>
                  <span>
                    {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    ${asset.price}
                  </span>

                  <Button
                    size="sm"
                    onClick={() => injectAsset(asset)}
                    disabled={isPurchased(asset.id) || injecting}
                    className={
                      isPurchased(asset.id)
                        ? 'bg-gray-400 hover:bg-gray-400'
                        : injecting && selectedAsset?.id === asset.id
                          ? 'bg-blue-600'
                          : ''
                    }
                  >
                    {injecting && selectedAsset?.id === asset.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Injecting...
                      </>
                    ) : isPurchased(asset.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Owned
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Inject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
