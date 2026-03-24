import { useState, useCallback, useRef, useEffect } from 'react';

export interface AIBlockSuggestion {
  id: string;
  name: string;
  description: string;
  reason: string;
  icon: string;
  props?: Record<string, any>;
}

export interface BuildAction {
  timestamp: string;
  type: 'add' | 'remove' | 'update' | 'drag' | 'ai-suggest';
  blockId: string;
  blockName: string;
  details?: any;
}

export interface UnifiedBuilderState {
  content: any;
  selectedBlockId: string | null;
  aiSuggestions: AIBlockSuggestion[];
  buildHistory: BuildAction[];
  isAIThinking: boolean;
  isDragging: boolean;
  lastAIPrompt: string;
  scopedContext: {
    currentBlockType?: string;
    pageTitle?: string;
    totalBlocks?: number;
  };
}

export interface UseUnifiedBuilderOptions {
  initialContent?: any;
  onContentChange?: (content: any) => void;
  onHistoryChange?: (history: BuildAction[]) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export function useUnifiedBuilder(options: UseUnifiedBuilderOptions = {}) {
  const {
    initialContent,
    onContentChange,
    onHistoryChange,
    autoSave = true,
    autoSaveInterval = 30000,
  } = options;

  // State
  const [state, setState] = useState<UnifiedBuilderState>({
    content: initialContent || { root: { type: 'root', props: {} } },
    selectedBlockId: null,
    aiSuggestions: [],
    buildHistory: [],
    isAIThinking: false,
    isDragging: false,
    lastAIPrompt: '',
    scopedContext: {},
  });

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update content and notify parent
   */
  const updateContent = useCallback((content: any) => {
    setState((s) => ({ ...s, content }));
    onContentChange?.(content);

    // Reset autosave timer
    if (autoSave) {
      clearInterval(autoSaveTimerRef.current!);
      autoSaveTimerRef.current = setTimeout(() => {
        console.log('[AutoSave]', new Date().toLocaleTimeString());
      }, autoSaveInterval);
    }
  }, [autoSave, autoSaveInterval, onContentChange]);

  /**
   * Get AI suggestions based on page context
   */
  const getAISuggestions = useCallback(
    async (prompt: string) => {
      setState((s) => ({ ...s, isAIThinking: true, lastAIPrompt: prompt }));

      try {
        const response = await fetch('/api/wonder-build/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            context: {
              ...state.scopedContext,
              currentBlocks:
                state.content.root?.children?.map((b: any) => ({
                  type: b.type,
                  id: b.id,
                })) || [],
            },
          }),
        });

        if (!response.ok) throw new Error('Failed to get suggestions');

        const data = await response.json();

        if (data.suggestions) {
          const suggestions: AIBlockSuggestion[] = data.suggestions.map(
            (sug: any) => ({
              id: sug.blockId || sug.id,
              name: sug.name || sug.type,
              description: sug.description || '',
              reason: sug.reason,
              icon: sug.icon || '📦',
              props: sug.props || {},
            })
          );

          setState((s) => ({
            ...s,
            aiSuggestions: suggestions,
            isAIThinking: false,
          }));

          return suggestions;
        }
      } catch (error) {
        console.error('AI suggestion error:', error);
        setState((s) => ({ ...s, isAIThinking: false }));
      }

      return [];
    },
    [state.scopedContext, state.content.root?.children]
  );

  /**
   * Add block to page
   */
  const addBlock = useCallback(
    (blockId: string, blockName: string, props?: Record<string, any>) => {
      const newBlock = {
        type: blockId,
        id: `${blockId}_${Date.now()}`,
        props: props || {},
      };

      updateContent({
        ...state.content,
        root: {
          ...state.content.root,
          children: [...(state.content.root?.children || []), newBlock],
        },
      });

      addToHistory({
        type: 'add',
        blockId,
        blockName,
        details: { newBlock },
      });

      setState((s) => ({ ...s, selectedBlockId: newBlock.id }));
    },
    [state.content, updateContent]
  );

  /**
   * Remove block
   */
  const removeBlock = useCallback(
    (blockId: string) => {
      const updatedChildren = state.content.root?.children?.filter(
        (b: any) => b.id !== blockId
      );

      updateContent({
        ...state.content,
        root: {
          ...state.content.root,
          children: updatedChildren || [],
        },
      });

      addToHistory({
        type: 'remove',
        blockId,
        blockName: 'Block',
      });

      setState((s) => ({ ...s, selectedBlockId: null }));
    },
    [state.content, updateContent]
  );

  /**
   * Update block properties
   */
  const updateBlock = useCallback(
    (blockId: string, props: Record<string, any>) => {
      const updatedChildren = state.content.root?.children?.map((b: any) =>
        b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b
      );

      updateContent({
        ...state.content,
        root: {
          ...state.content.root,
          children: updatedChildren || [],
        },
      });

      addToHistory({
        type: 'update',
        blockId,
        blockName: 'Block',
        details: { props },
      });
    },
    [state.content, updateContent]
  );

  /**
   * Reorder blocks (drag & drop)
   */
  const reorderBlocks = useCallback(
    (fromIndex: number, toIndex: number) => {
      const children = [...(state.content.root?.children || [])];
      const [movedBlock] = children.splice(fromIndex, 1);
      children.splice(toIndex, 0, movedBlock);

      updateContent({
        ...state.content,
        root: {
          ...state.content.root,
          children,
        },
      });

      addToHistory({
        type: 'drag',
        blockId: movedBlock.id,
        blockName: movedBlock.type,
        details: { fromIndex, toIndex },
      });
    },
    [state.content, updateContent]
  );

  /**
   * Set dragging state
   */
  const setDragging = useCallback((isDragging: boolean) => {
    setState((s) => ({ ...s, isDragging }));
  }, []);

  /**
   * Select block
   */
  const selectBlock = useCallback((blockId: string | null) => {
    setState((s) => ({ ...s, selectedBlockId: blockId }));
  }, []);

  /**
   * Add to history
   */
  const addToHistory = useCallback(
    (action: Omit<BuildAction, 'timestamp'>) => {
      const newAction: BuildAction = {
        ...action,
        timestamp: new Date().toLocaleTimeString(),
      };

      setState((s) => {
        const newHistory = [...s.buildHistory, newAction].slice(-50); // Keep last 50
        onHistoryChange?.(newHistory);
        return { ...s, buildHistory: newHistory };
      });
    },
    [onHistoryChange]
  );

  /**
   * Update scoped context (for AI awareness)
   */
  const updateScopedContext = useCallback(
    (context: Partial<UnifiedBuilderState['scopedContext']>) => {
      setState((s) => ({
        ...s,
        scopedContext: { ...s.scopedContext, ...context },
      }));
    },
    []
  );

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setState((s) => ({ ...s, buildHistory: [] }));
    onHistoryChange?.([]);
  }, [onHistoryChange]);

  /**
   * Export as JSON
   */
  const exportAsJSON = useCallback(() => {
    return JSON.stringify(state.content, null, 2);
  }, [state.content]);

  /**
   * Import from JSON
   */
  const importFromJSON = useCallback((jsonStr: string) => {
    try {
      const imported = JSON.parse(jsonStr);
      updateContent(imported);
      addToHistory({
        type: 'update',
        blockId: 'import',
        blockName: 'Imported Page',
      });
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }, [updateContent]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearInterval(autoSaveTimerRef.current!);
    };
  }, []);

  return {
    // State
    ...state,

    // Content operations
    updateContent,
    addBlock,
    removeBlock,
    updateBlock,
    reorderBlocks,

    // AI operations
    getAISuggestions,

    // UI state
    selectBlock,
    setDragging,
    updateScopedContext,

    // History
    addToHistory,
    clearHistory,

    // Export/Import
    exportAsJSON,
    importFromJSON,
  };
}

export type UseUnifiedBuilderReturn = ReturnType<typeof useUnifiedBuilder>;
