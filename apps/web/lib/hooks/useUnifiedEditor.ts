import { useState, useCallback, useEffect, useRef } from 'react';
import { NodeMapper, WebGLStudioNode, PlayCanvasEntity, IntegratedSceneNode } from '@/lib/engines/webglstudio-playcanvas/nodeMapper';
import { SandboxedPlayCanvasRuntime } from '@/lib/engines/webglstudio-playcanvas/sandboxRuntime';
import { BYOCExporter, BYOCSceneBundle } from '@/lib/engines/webglstudio-playcanvas/byocExporter';

export interface UseUnifiedEditorOptions {
  initialScene?: BYOCSceneBundle;
  onSceneChange?: (bundle: BYOCSceneBundle) => void;
  autoSaveInterval?: number; // milliseconds, 0 to disable
  syncMode?: 'real-time' | 'manual';
}

export interface UnifiedEditorState {
  bundle: BYOCSceneBundle | null;
  selectedNode: IntegratedSceneNode | null;
  isInitialized: boolean;
  isSyncing: boolean;
  error: string | null;
  syncMode: 'real-time' | 'manual';
  exportProgress: number;
}

export function useUnifiedEditor(options: UseUnifiedEditorOptions = {}) {
  const {
    initialScene,
    onSceneChange,
    autoSaveInterval = 30000,
    syncMode: initialSyncMode = 'manual',
  } = options;

  // State
  const [state, setState] = useState<UnifiedEditorState>({
    bundle: initialScene || null,
    selectedNode: null,
    isInitialized: false,
    isSyncing: false,
    error: null,
    syncMode: initialSyncMode,
    exportProgress: 0,
  });

  // Refs
  const runtimeRef = useRef<SandboxedPlayCanvasRuntime | null>(null);
  const autosaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncProxiesRef = useRef<Map<string, any>>(new Map());

  /**
   * Initialize the editor
   */
  const initialize = useCallback(async (canvasElement: HTMLCanvasElement) => {
    try {
      setState((s) => ({ ...s, isInitialized: false, error: null }));

      const runtime = new SandboxedPlayCanvasRuntime({
        canvasElement,
        width: 800,
        height: 600,
        localAssetsPath: '/public/playcanvas-assets',
      });

      await runtime.initialize();
      runtimeRef.current = runtime;

      // Load initial scene
      if (state.bundle) {
        await runtime.loadScene(state.bundle.playcanvasEntities);
      }

      setState((s) => ({ ...s, isInitialized: true }));

      // Setup autosave
      if (autoSaveInterval > 0) {
        autosaveIntervalRef.current = setInterval(() => {
          if (state.syncMode === 'real-time') {
            exportScene();
          }
        }, autoSaveInterval);
      }

      return runtime;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Initialization failed';
      setState((s) => ({ ...s, error: errorMsg }));
      throw err;
    }
  }, [state.bundle, state.syncMode, autoSaveInterval]);

  /**
   * Update bundle state
   */
  const updateBundle = useCallback((bundle: BYOCSceneBundle) => {
    setState((s) => ({ ...s, bundle }));
    onSceneChange?.(bundle);
  }, [onSceneChange]);

  /**
   * Export scene from PlayCanvas runtime
   */
  const exportScene = useCallback(async () => {
    if (!runtimeRef.current || !state.bundle) return;

    try {
      setState((s) => ({ ...s, isSyncing: true, exportProgress: 10 }));

      const pcEntities = runtimeRef.current.exportSceneAsJSON();

      setState((s) => ({ ...s, exportProgress: 50 }));

      const updated: BYOCSceneBundle = {
        ...state.bundle,
        playcanvasEntities: pcEntities,
        createdAt: new Date().toISOString(),
      };

      setState((s) => ({ ...s, exportProgress: 100 }));

      updateBundle(updated);

      setTimeout(() => {
        setState((s) => ({ ...s, isSyncing: false, exportProgress: 0 }));
      }, 500);

      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Export failed';
      setState((s) => ({ ...s, error: errorMsg, isSyncing: false }));
    }
  }, [state.bundle, updateBundle]);

  /**
   * Sync WebGL Studio nodes to PlayCanvas
   */
  const syncWebGLToPlayCanvas = useCallback((nodes: WebGLStudioNode[]) => {
    if (!runtimeRef.current || !state.bundle) return;

    try {
      const merged = NodeMapper.mergeScenes(nodes, state.bundle.playcanvasEntities);

      // Update PlayCanvas entities
      for (const node of merged) {
        if (node.playcanvasEntityId && state.syncMode === 'real-time') {
          const pcEntity = NodeMapper.toPlayCanvasEntity(node);
          runtimeRef.current.updateEntity(node.playcanvasEntityId, pcEntity);
        }
      }

      const updated: BYOCSceneBundle = {
        ...state.bundle,
        webglstudioNodes: nodes,
        playcanvasEntities: merged
          .filter((n) => n.playcanvasEntityId)
          .map((n) => NodeMapper.toPlayCanvasEntity(n)),
      };

      updateBundle(updated);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      setState((s) => ({ ...s, error: errorMsg }));
    }
  }, [state.bundle, state.syncMode, updateBundle]);

  /**
   * Sync PlayCanvas to WebGL
   */
  const syncPlayCanvasToWebGL = useCallback(() => {
    if (!runtimeRef.current || !state.bundle) return;

    try {
      const exported = runtimeRef.current.exportSceneAsJSON();
      const webglNodes = exported.map((entity) => NodeMapper.toWebGLStudioNode(entity));

      const updated: BYOCSceneBundle = {
        ...state.bundle,
        playcanvasEntities: exported,
      };

      updateBundle(updated);
      return webglNodes;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      setState((s) => ({ ...s, error: errorMsg }));
    }
  }, [state.bundle, updateBundle]);

  /**
   * Select a node
   */
  const selectNode = useCallback((nodeId: string) => {
    if (!state.bundle) return;

    const merged = NodeMapper.mergeScenes(state.bundle.webglstudioNodes, state.bundle.playcanvasEntities);
    const node = merged.find((n) => n.id === nodeId);

    if (node) {
      setState((s) => ({ ...s, selectedNode: node }));

      // Highlight in PlayCanvas
      if (node.playcanvasEntityId && runtimeRef.current) {
        const entity = runtimeRef.current.getEntity(node.playcanvasEntityId);
        console.log('[Editor] Selected:', entity?.name || node.name);
      }
    }
  }, [state.bundle]);

  /**
   * Download scene
   */
  const downloadScene = useCallback(async (filename?: string) => {
    if (!state.bundle) return;

    try {
      await exportScene();

      if (state.bundle) {
        BYOCExporter.downloadAsFile(state.bundle, filename || 'scene');
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [state.bundle, exportScene]);

  /**
   * Load scene from file
   */
  const loadScene = useCallback(async (file: File) => {
    try {
      const bundle = await BYOCExporter.fromFile(file);

      // Load into PlayCanvas
      if (runtimeRef.current) {
        await runtimeRef.current.loadScene(bundle.playcanvasEntities);
      }

      updateBundle(bundle);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Load failed';
      setState((s) => ({ ...s, error: errorMsg }));
    }
  }, [updateBundle]);

  /**
   * Create share link
   */
  const createShareLink = useCallback(() => {
    if (!state.bundle) return null;
    return BYOCExporter.createShareLink(state.bundle);
  }, [state.bundle]);

  /**
   * Set sync mode
   */
  const setSyncMode = useCallback((mode: 'real-time' | 'manual') => {
    setState((s) => ({ ...s, syncMode: mode }));
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  /**
   * Cleanup
   */
  const dispose = useCallback(() => {
    clearInterval(autosaveIntervalRef.current!);
    runtimeRef.current?.dispose();
    syncProxiesRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispose();
    };
  }, [dispose]);

  return {
    // State
    ...state,

    // Initialization
    initialize,

    // Sync operations
    syncWebGLToPlayCanvas,
    syncPlayCanvasToWebGL,
    exportScene,

    // Node management
    selectNode,

    // File operations
    downloadScene,
    loadScene,

    // Utilities
    createShareLink,
    setSyncMode,
    clearError,

    // Cleanup
    dispose,

    // PlayCanvas runtime
    getRuntimeInstance: () => runtimeRef.current,
  };
}

export type UseUnifiedEditorReturn = ReturnType<typeof useUnifiedEditor>;
