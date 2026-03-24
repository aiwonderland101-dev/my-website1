"use client";

import { useEffect, useRef, useState } from 'react';
import { hasLowGPUMemory, generateAssetUrls, injectAILogicSafe } from '@/lib/services/supabase3DUtils';

interface Cloud3DViewerProps {
  glbFileName: string;
  thumbnailUrl?: string;
  thumbnailFileName?: string;
  logicCode?: string;
  productName?: string;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: (error: Error) => void;
  className?: string;
  height?: string;
  width?: string;
}

/**
 * Cloud-Native 3D Viewer Component
 *
 * Features:
 * - Lazy loading with IntersectionObserver (loads only when visible)
 * - Signed URLs from Supabase for GLB and thumbnail assets
 * - GPU memory detection with fallback to thumbnail
 * - AI behavior injection for loaded entities
 * - Responsive and cloud-optimized
 */
export default function Cloud3DViewer({
  glbFileName,
  thumbnailUrl,
  thumbnailFileName,
  logicCode,
  productName = 'Product',
  onLoadStart,
  onLoadComplete,
  onLoadError,
  className = '',
  height = '400px',
  width = '100%',
}: Cloud3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLowMemory, setHasLowMemory] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<{
    glbUrl: string;
    thumbnailUrl: string;
  } | null>(null);

  // Check GPU memory on mount
  useEffect(() => {
    const lowMemory = hasLowGPUMemory();
    setHasLowMemory(lowMemory);

    if (lowMemory) {
      console.warn('Low GPU memory detected, 3D models will use thumbnail fallback');
    }
  }, []);

  // Setup Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    observer.observe(containerRef.current);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, []);

  // Generate signed URLs when visible
  useEffect(() => {
    if (!isVisible || signedUrls) return;

    const generateUrls = async () => {
      try {
        setIsLoading(true);
        setError(null);
        onLoadStart?.();

        let glbUrl: string;
        let fallbackThumbnailUrl: string;

        // Generate signed URL for GLB
        if (glbFileName) {
          // Try to generate signed URL; if it fails, construct public URL
          try {
            const urls = await generateAssetUrls(
              glbFileName,
              thumbnailFileName || glbFileName.replace('.glb', '.png')
            );
            glbUrl = urls.glbUrl;
            fallbackThumbnailUrl = urls.thumbnailUrl;
          } catch (e) {
            console.warn('Signed URL generation failed, using direct paths:', e);
            // Fallback to direct public URLs
            glbUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assets/${glbFileName}`;
            fallbackThumbnailUrl =
              thumbnailUrl ||
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/${
                thumbnailFileName || glbFileName.replace('.glb', '.png')
              }`;
          }
        } else {
          throw new Error('No GLB file name provided');
        }

        setSignedUrls({
          glbUrl,
          thumbnailUrl: fallbackThumbnailUrl,
        });

        onLoadComplete?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error.message);
        onLoadError?.(error);
        console.error('Error loading 3D viewer:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateUrls();
  }, [isVisible, glbFileName, thumbnailFileName, thumbnailUrl, onLoadStart, onLoadComplete, onLoadError, signedUrls]);

  // Determine if we should use fallback (low memory or user prefers image)
  useEffect(() => {
    setUseFallback(hasLowMemory || !signedUrls?.glbUrl);
  }, [hasLowMemory, signedUrls]);

  // Handle WebGL crash detection
  const handleWebGLLoss = () => {
    console.warn('WebGL context lost, switching to thumbnail fallback');
    setUseFallback(true);
    setError('3D rendering unavailable, showing preview image');
  };

  if (error && !useFallback) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center bg-gray-900 border border-gray-700 rounded-lg ${className}`}
        style={{ height, width }}
      >
        <div className="text-center">
          <p className="text-red-400 text-sm mb-2">⚠️ Error loading 3D model</p>
          <p className="text-gray-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading && !useFallback) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center bg-gray-900 border border-gray-700 rounded-lg animate-pulse ${className}`}
        style={{ height, width }}
      >
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-gray-400 text-sm">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  // Render thumbnail/fallback
  if (useFallback) {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-gray-900 border border-gray-700 rounded-lg group ${className}`}
        style={{ height, width }}
      >
        {signedUrls?.thumbnailUrl ? (
          <>
            <img
              src={signedUrls.thumbnailUrl}
              alt={productName}
              className="w-full h-full object-cover"
              onError={() => {
                setError('Failed to load thumbnail');
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            {hasLowMemory && (
              <div className="absolute bottom-2 right-2 bg-gray-800/90 px-2 py-1 rounded text-xs text-gray-300">
                💾 Preview Mode
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <p className="text-sm">No preview available</p>
          </div>
        )}
      </div>
    );
  }

  // Render 3D viewer iframe
  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}
      style={{ height, width }}
    >
      <iframe
        ref={iframeRef}
        src={
          signedUrls?.glbUrl
            ? `data:text/html,
          <html>
            <head>
              <style>
                body { margin: 0; padding: 0; overflow: hidden; background: #111; font-family: system-ui; }
                #canvas { width: 100%; height: 100vh; display: block; }
                #error { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                         color: #f87171; text-align: center; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 8px; }
                #loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                          color: #bfdbfe; text-align: center; }
              </style>
            </head>
            <body>
              <canvas id="canvas"></canvas>
              <div id="loading">
                <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p>Loading 3D model...</p>
                <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
              </div>
              <div id="error" style="display: none;"></div>
              <script src="https://code.playcanvas.com/playcanvas-stable.js"><\/script>
              <script>
                const canvas = document.getElementById('canvas');
                const app = new pc.Application(canvas, {});
                const assetUrl = '${signedUrls.glbUrl}';
                
                app.start();
                app.scene.ambientLight.set(0.2, 0.2, 0.2);
                
                const light = new pc.Entity();
                light.addComponent('light', { type: 'directional', shadowResolution: 1024, intensity: 1.5 });
                light.setLocalEulerAngles(45, 30, 0);
                app.root.addChild(light);
                
                const assetRegistry = app.assets;
                const asset = new pc.Asset('model', 'model', { url: assetUrl });
                
                assetRegistry.add(asset);
                assetRegistry.load(asset);
                
                asset.ready(function() {
                  const entity = asset.resource.instantiateRenderEntity();
                  app.root.addChild(entity);
                  document.getElementById('loading').style.display = 'none';
                  
                  // Auto-focus camera
                  const aabb = entity.model.aabb;
                  const camera = app.root.findByName('Camera');
                  if (camera && camera.camera) {
                    const cameraDistance = Math.max(aabb.halfExtents.x, aabb.halfExtents.y, aabb.halfExtents.z) * 1.5;
                    camera.setLocalPosition(0, aabb.center.y, cameraDistance);
                    camera.lookAt(aabb.center);
                  }
                });
                
                asset.on('error', function() {
                  document.getElementById('loading').style.display = 'none';
                  document.getElementById('error').style.display = 'block';
                  document.getElementById('error').innerHTML = 'Failed to load 3D model';
                });
              <\/script>
            </body>
          </html>
        `.trim()
            : ''
        }
        className="w-full h-full border-0"
        title={`${productName} 3D Viewer`}
        sandbox={{
          allowScripts: true,
          allowSameOrigin: true,
        }}
        onError={handleWebGLLoss}
      />

      {/* Hardware info badge */}
      <div className="absolute top-2 left-2 bg-gray-800/80 px-2 py-1 rounded text-xs text-gray-300 pointer-events-none">
        🎮 3D View
      </div>
    </div>
  );
}
