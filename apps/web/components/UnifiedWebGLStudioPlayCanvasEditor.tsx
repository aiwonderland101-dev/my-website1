'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NodeMapper, WebGLStudioNode, PlayCanvasEntity, IntegratedSceneNode } from '@/lib/engines/webglstudio-playcanvas/nodeMapper';
import { SandboxedPlayCanvasRuntime, SandboxConfig } from '@/lib/engines/webglstudio-playcanvas/sandboxRuntime';
import { BYOCExporter, BYOCSceneBundle } from '@/lib/engines/webglstudio-playcanvas/byocExporter';

export interface UnifiedEditorProps {
  initialScene?: BYOCSceneBundle;
  onSceneChange?: (bundle: BYOCSceneBundle) => void;
  readOnly?: boolean;
}

export const UnifiedWebGLStudioPlayCanvasEditor: React.FC<UnifiedEditorProps> = ({
  initialScene,
  onSceneChange,
  readOnly = false,
}) => {
  // Refs
  const webglContainerRef = useRef<HTMLDivElement>(null);
  const playcanvasCanvasRef = useRef<HTMLCanvasElement>(null);
  const webglIframeRef = useRef<HTMLIFrameElement>(null);

  // State
  const [runtimeInitialized, setRuntimeInitialized] = useState(false);
  const [sceneBundle, setSceneBundle] = useState<BYOCSceneBundle | null>(initialScene || null);
  const [selectedNode, setSelectedNode] = useState<IntegratedSceneNode | null>(null);
  const [syncMode, setSyncMode] = useState<'real-time' | 'manual'>('real-time');
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Instance refs
  const runtimeRef = useRef<SandboxedPlayCanvasRuntime | null>(null);
  const syncProxiesRef = useRef<Map<string, any>>(new Map());
  const autosaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize the unified editor
   */
  useEffect(() => {
    initializeEditor();

    return () => {
      // Cleanup
      clearInterval(autosaveIntervalRef.current!);
      runtimeRef.current?.dispose();
    };
  }, []);

  const initializeEditor = async () => {
    try {
      // Initialize PlayCanvas runtime
      if (playcanvasCanvasRef.current) {
        const config: SandboxConfig = {
          canvasElement: playcanvasCanvasRef.current,
          width: 800,
          height: 600,
          localAssetsPath: '/public/playcanvas-assets',
        };

        runtimeRef.current = new SandboxedPlayCanvasRuntime(config);
        await runtimeRef.current.initialize();

        // Load initial scene if available
        if (sceneBundle) {
          await runtimeRef.current.loadScene(sceneBundle.playcanvasEntities);
        }

        setRuntimeInitialized(true);
      }

      // Setup autosave
      autosaveIntervalRef.current = setInterval(() => {
        if (syncMode === 'real-time' && sceneBundle) {
          exportAndAutoSave();
        }
      }, 30000); // Autosave every 30 seconds
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize editor';
      console.error(errorMsg);
      setError(errorMsg);
    }
  };

  /**
   * Handle WebGL Studio messages
   */
  const handleWebGLMessage = useCallback((event: MessageEvent) => {
    if (!event.data) return;

    const { type, data } = event.data;

    switch (type) {
      case 'scene:node-selected':
        handleNodeSelected(data);
        break;

      case 'scene:nodes-updated':
        handleNodesUpdated(data);
        break;

      case 'scene:save':
        exportAndSave();
        break;

      case 'scene:export':
        handleExport();
        break;

      default:
        console.log('[WebGL Studio]', type, data);
    }
  }, []);

  /**
   * Handle node selection from WebGL Studio
   */
  const handleNodeSelected = useCallback((node: WebGLStudioNode) => {
    if (!sceneBundle) return;

    const merged = NodeMapper.mergeScenes(sceneBundle.webglstudioNodes, sceneBundle.playcanvasEntities);
    const selected = merged.find((n) => n.id === node.id);

    if (selected) {
      setSelectedNode(selected);

      // Highlight in PlayCanvas if it has a mapped entity
      if (selected.playcanvasEntityId && runtimeRef.current) {
        const entity = runtimeRef.current.getEntity(selected.playcanvasEntityId);
        if (entity) {
          // Visual highlight (could add outline shader, etc.)
          console.log('[Editor] Selected entity:', entity.name);
        }
      }
    }
  }, [sceneBundle]);

  /**
   * Handle nodes update from WebGL Studio
   */
  const handleNodesUpdated = useCallback((nodes: WebGLStudioNode[]) => {
    if (!sceneBundle || !runtimeRef.current) return;

    // Merge with PlayCanvas entities
    const merged = NodeMapper.mergeScenes(nodes, sceneBundle.playcanvasEntities);

    // Update PlayCanvas entities in real-time
    for (const node of merged) {
      if (node.playcanvasEntityId && syncMode === 'real-time') {
        const pcEntity = NodeMapper.toPlayCanvasEntity(node);
        runtimeRef.current.updateEntity(node.playcanvasEntityId, pcEntity);
      }
    }

    // Update bundle
    const updated: BYOCSceneBundle = {
      ...sceneBundle,
      webglstudioNodes: nodes,
      playcanvasEntities: merged
        .filter((n) => n.playcanvasEntityId)
        .map((n) => NodeMapper.toPlayCanvasEntity(n)),
    };

    setSceneBundle(updated);
    onSceneChange?.(updated);
  }, [sceneBundle, syncMode, onSceneChange]);

  /**
   * Manual sync from PlayCanvas to WebGL Studio
   */
  const syncPlayCanvasToWebGL = useCallback(() => {
    if (!runtimeRef.current || !sceneBundle) return;

    const exported = runtimeRef.current.exportSceneAsJSON();

    // Convert PlayCanvas entities to WebGL nodes
    const webglNodes = exported.map((entity) => NodeMapper.toWebGLStudioNode(entity));

    // Notify WebGL Studio
    webglIframeRef.current?.contentWindow?.postMessage(
      {
        type: 'scene:playcanvas-sync',
        data: webglNodes,
      },
      '*'
    );

    // Update bundle
    const updated: BYOCSceneBundle = {
      ...sceneBundle,
      playcanvasEntities: exported,
    };

    setSceneBundle(updated);
  }, [sceneBundle]);

  /**
   * Export current scene
   */
  const exportAndSave = useCallback(async () => {
    if (!runtimeRef.current || !sceneBundle) return;

    try {
      setExportProgress(10);

      // Get latest data from PlayCanvas
      const pcEntities = runtimeRef.current.exportSceneAsJSON();

      setExportProgress(50);

      // Get latest data from WebGL Studio (if accessible)
      // This would require the WebGL Studio iframe to send the data back

      setExportProgress(75);

      // Create bundle
      const bundle: BYOCSceneBundle = {
        ...sceneBundle,
        playcanvasEntities: pcEntities,
        createdAt: new Date().toISOString(),
      };

      setSceneBundle(bundle);
      onSceneChange?.(bundle);

      setExportProgress(100);
      setTimeout(() => setExportProgress(0), 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Export failed';
      setError(errorMsg);
    }
  }, [sceneBundle, onSceneChange]);

  /**
   * Export as downloadable file
   */
  const handleExport = useCallback(() => {
    exportAndSave().then(() => {
      if (sceneBundle) {
        BYOCExporter.downloadAsFile(sceneBundle, 'scene');
      }
    });
  }, [sceneBundle, exportAndSave]);

  /**
   * Export and auto-save
   */
  const exportAndAutoSave = useCallback(() => {
    exportAndSave();
  }, [exportAndSave]);

  /**
   * Load a scene from file
   */
  const handleLoadFile = useCallback(async (file: File) => {
    try {
      const bundle = await BYOCExporter.fromFile(file);
      setSceneBundle(bundle);

      // Load into PlayCanvas
      if (runtimeRef.current) {
        await runtimeRef.current.loadScene(bundle.playcanvasEntities);
      }

      // Notify WebGL Studio
      webglIframeRef.current?.contentWindow?.postMessage(
        {
          type: 'scene:load',
          data: bundle.webglstudioNodes,
        },
        '*'
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load file';
      setError(errorMsg);
    }
  }, []);

  /**
   * Create share link
   */
  const handleCreateShareLink = useCallback(() => {
    if (sceneBundle) {
      const link = BYOCExporter.createShareLink(sceneBundle);
      navigator.clipboard.writeText(link);
      alert('Share link copied to clipboard!');
    }
  }, [sceneBundle]);

  // Setup message listener
  useEffect(() => {
    window.addEventListener('message', handleWebGLMessage);
    return () => window.removeEventListener('message', handleWebGLMessage);
  }, [handleWebGLMessage]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 text-gray-100">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">WebGL Studio × PlayCanvas</h1>
          <span className="px-2 py-1 bg-green-600 rounded text-sm">
            {runtimeInitialized ? 'Ready' : 'Loading...'}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sync Mode */}
          <select
            value={syncMode}
            onChange={(e) => setSyncMode(e.target.value as 'real-time' | 'manual')}
            className="px-3 py-1 bg-gray-700 rounded text-sm border border-gray-600"
          >
            <option value="real-time">Real-time Sync</option>
            <option value="manual">Manual Sync</option>
          </select>

          {/* Manual Sync Button */}
          {syncMode === 'manual' && (
            <button
              onClick={syncPlayCanvasToWebGL}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              disabled={readOnly}
            >
              Sync Now
            </button>
          )}

          {/* Export */}
          <button
            onClick={handleExport}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            disabled={readOnly}
          >
            Download
          </button>

          {/* Share */}
          <button
            onClick={handleCreateShareLink}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
          >
            Share
          </button>

          {/* Load */}
          <label className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm cursor-pointer">
            Load
            <input
              type="file"
              accept=".byoc.json"
              onChange={(e) => e.target.files?.[0] && handleLoadFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-600 text-white p-3 text-sm">
          Error: {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Export Progress */}
      {exportProgress > 0 && exportProgress < 100 && (
        <div className="bg-gray-700 h-1">
          <div className="bg-green-500 h-full" style={{ width: `${exportProgress}%` }} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* WebGL Studio Editor */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded border border-gray-700 overflow-hidden">
          <div className="text-xs font-mono p-2 bg-gray-900 border-b border-gray-700">
            WebGL Studio Editor
          </div>
          <div
            ref={webglContainerRef}
            className="flex-1 overflow-auto"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='%23374151'/%3E%3Cpath d='M 20 0 L 0 20 M 20 20 L 0 20 M 0 0 L 20 20' stroke='%234B5563' stroke-width='0.5'/%3E%3C/svg%3E")`,
            }}
          >
            <iframe
              ref={webglIframeRef}
              src="/webglstudio/editor/index.html"
              className="w-full h-full border-0"
              title="WebGL Studio Editor"
            />
          </div>
        </div>

        {/* PlayCanvas Viewport */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded border border-gray-700 overflow-hidden">
          <div className="text-xs font-mono p-2 bg-gray-900 border-b border-gray-700">
            PlayCanvas Runtime (Sandboxed)
          </div>
          <canvas
            ref={playcanvasCanvasRef}
            className="flex-1 bg-black"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="bg-gray-800 border-t border-gray-700 p-4 max-h-48 overflow-auto">
          <div className="text-sm font-mono">
            <div className="font-bold mb-2">{selectedNode.name}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Position:</span>
                <div className="font-mono text-blue-400">
                  [{selectedNode.position?.map((v) => v.toFixed(2)).join(', ')}]
                </div>
              </div>
              <div>
                <span className="text-gray-400">Scale:</span>
                <div className="font-mono text-green-400">
                  [{selectedNode.scale?.map((v) => v.toFixed(2)).join(', ')}]
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-gray-900 border-t border-gray-700 p-2 text-xs text-gray-400 flex justify-between">
        <div>
          {sceneBundle
            ? `Scene: ${sceneBundle.name} • Entities: ${sceneBundle.playcanvasEntities.length} • Nodes: ${sceneBundle.webglstudioNodes.length}`
            : 'No scene loaded'}
        </div>
        <div>{new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default UnifiedWebGLStudioPlayCanvasEditor;
