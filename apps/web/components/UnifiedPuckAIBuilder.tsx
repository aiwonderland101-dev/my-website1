'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Puck, PuckAction } from '@puckeditor/core';
import puckConfig from './puck.config';
import { AiChat } from '@/ui/components/AiChat';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface UnifiedPageState {
  content: any;
  selectedBlockId: string | null;
  aiSuggestions: Array<{
    id: string;
    name: string;
    reason: string;
    icon: string;
  }>;
  buildHistory: Array<{
    timestamp: string;
    action: string;
    blockId: string;
  }>;
  isAIThinking: boolean;
}

export const UnifiedPuckAIBuilder: React.FC<{
  initialContent?: any;
  onSave?: (content: any) => void;
  mode?: 'edit' | 'view';
}> = ({ initialContent, onSave, mode = 'edit' }) => {
  // State
  const [state, setState] = useState<UnifiedPageState>({
    content: initialContent || { root: { type: 'root', props: {} } },
    selectedBlockId: null,
    aiSuggestions: [],
    buildHistory: [],
    isAIThinking: false,
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiMode, setAiMode] = useState<'suggest' | 'chat' | 'build'>('suggest');
  const [userPrompt, setUserPrompt] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Refs
  const puckRef = useRef<any>(null);
  const draggedBlockRef = useRef<string | null>(null);

  /**
   * Get AI suggestions based on current page structure and user intent
   */
  const getAISuggestions = useCallback(async (prompt: string) => {
    setState((s) => ({ ...s, isAIThinking: true }));

    try {
      const response = await fetch('/api/wonder-build/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          context: {
            pageTitle: 'Building with Puck + AI',
            currentBlocks: state.content.root?.children?.map((b: any) => b.type) || [],
          },
        }),
      });

      const data = await response.json();

      if (data.suggestions) {
        setState((s) => ({
          ...s,
          aiSuggestions: data.suggestions.map((sug: any) => ({
            id: sug.blockId || sug.id,
            name: sug.name || sug.type,
            reason: sug.reason,
            icon: sug.icon || '📦',
          })),
          isAIThinking: false,
        }));
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      setState((s) => ({ ...s, isAIThinking: false }));
    }
  }, [state.content]);

  /**
   * Handle drag start from sidebar
   */
  const handleDragStartFromSidebar = useCallback((blockId: string, blockName: string) => {
    draggedBlockRef.current = blockId;

    // Log to history
    setState((s) => ({
      ...s,
      buildHistory: [
        ...s.buildHistory,
        {
          timestamp: new Date().toLocaleTimeString(),
          action: `Dragged ${blockName}`,
          blockId,
        },
      ],
    }));
  }, []);

  /**
   * Handle block insertion from suggestions
   */
  const handleInsertBlock = useCallback((blockId: string, blockName: string) => {
    // In a real implementation, this would insert the block into Puck
    console.log(`Insert block: ${blockName} (${blockId})`);

    // Log to history
    setState((s) => ({
      ...s,
      selectedBlockId: blockId,
      buildHistory: [
        ...s.buildHistory,
        {
          timestamp: new Date().toLocaleTimeString(),
          action: `Added ${blockName}`,
          blockId,
        },
      ],
    }));
  }, []);

  /**
   * Handle AI prompt submission
   */
  const handleAIPrompt = useCallback(async (prompt: string) => {
    setUserPrompt('');

    if (aiMode === 'suggest') {
      await getAISuggestions(prompt);
    } else if (aiMode === 'build') {
      // This would trigger the full AI builder with agents
      setState((s) => ({ ...s, isAIThinking: true }));

      try {
        const response = await fetch('/api/build/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'website',
            prompt: prompt,
          }),
        });

        if (response.ok) {
          const reader = response.body?.getReader();
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const text = new TextDecoder().decode(value);
              console.log('Build stream:', text);
            }
          }
        }
      } catch (error) {
        console.error('Build error:', error);
      } finally {
        setState((s) => ({ ...s, isAIThinking: false }));
      }
    }
  }, [aiMode, getAISuggestions]);

  /**
   * Copy current page as JSON
   */
  const handleCopyJSON = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(state.content, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  }, [state.content]);

  /**
   * Export page
   */
  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(state.content, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `page_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state.content]);

  /**
   * Save page
   */
  const handleSave = useCallback(() => {
    onSave?.(state.content);
    alert('Page saved!');
  }, [state.content, onSave]);

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-100">
      {/* Main Puck Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">Puck + AI Builder</h1>
            <Badge variant="secondary" className="ml-2">
              {state.buildHistory.length} actions
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {mode === 'edit' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyJSON}
                  className="text-xs"
                >
                  {copyFeedback ? '✓ Copied' : 'Copy JSON'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExport}
                  className="text-xs"
                >
                  Export
                </Button>

                <Button
                  size="sm"
                  className="text-xs"
                  onClick={handleSave}
                >
                  Save Page
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-xs"
            >
              {sidebarOpen ? '←' : '→'} AI
            </Button>
          </div>
        </div>

        {/* Puck Canvas */}
        <div className="flex-1 overflow-auto bg-gray-850">
          {mode === 'edit' ? (
            <div className="h-full w-full">
              <Puck
                config={puckConfig}
                data={state.content}
                onChange={(data: any) => {
                  setState((s) => ({ ...s, content: data }));
                }}
                ref={puckRef}
              >
                <Puck.Layout>
                  <div className="relative h-full">
                    {/* Puck will render here */}
                  </div>
                </Puck.Layout>
              </Puck>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              View Mode - AI Sidebar Only
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      {sidebarOpen && (
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden">
          {/* Mode Selector */}
          <div className="bg-gray-850 border-b border-gray-700 p-3 flex gap-2">
            <Button
              size="sm"
              variant={aiMode === 'suggest' ? 'default' : 'ghost'}
              onClick={() => setAiMode('suggest')}
              className="flex-1 text-xs"
            >
              💡 Suggest
            </Button>
            <Button
              size="sm"
              variant={aiMode === 'chat' ? 'default' : 'ghost'}
              onClick={() => setAiMode('chat')}
              className="flex-1 text-xs"
            >
              💬 Chat
            </Button>
            <Button
              size="sm"
              variant={aiMode === 'build' ? 'default' : 'ghost'}
              onClick={() => setAiMode('build')}
              className="flex-1 text-xs"
            >
              🚀 Build
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-3">
            {aiMode === 'suggest' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-2">
                    What do you want to build?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 'contact form' or 'hero section'"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && userPrompt.trim()) {
                        handleAIPrompt(userPrompt);
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <Button
                  onClick={() => userPrompt && handleAIPrompt(userPrompt)}
                  disabled={!userPrompt || state.isAIThinking}
                  className="w-full text-sm"
                >
                  {state.isAIThinking ? '✨ Loading...' : '✨ Get Suggestions'}
                </Button>

                {state.aiSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-300">
                      Suggested Blocks:
                    </p>
                    {state.aiSuggestions.map((suggestion) => (
                      <Card
                        key={suggestion.id}
                        className="p-2 bg-gray-700 border-gray-600 cursor-move hover:bg-gray-600 transition"
                        draggable
                        onDragStart={() =>
                          handleDragStartFromSidebar(suggestion.id, suggestion.name)
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-gray-100">
                              {suggestion.icon} {suggestion.name}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {suggestion.reason}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleInsertBlock(suggestion.id, suggestion.name)
                            }
                            className="text-xs"
                          >
                            +
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {aiMode === 'chat' && (
              <div className="flex flex-col h-full">
                <AiChat
                  onSubmit={handleAIPrompt}
                  theme="neon"
                  placeholder="Ask AI for help building your page..."
                />
              </div>
            )}

            {aiMode === 'build' && (
              <div className="space-y-3">
                <Alert>
                  <AlertDescription className="text-sm">
                    🚀 AI Builder will generate HTML/CSS/JS from your description
                  </AlertDescription>
                </Alert>

                <textarea
                  placeholder="Describe what you want to build..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />

                <Button
                  onClick={() => userPrompt && handleAIPrompt(userPrompt)}
                  disabled={!userPrompt || state.isAIThinking}
                  className="w-full"
                >
                  {state.isAIThinking ? '🔄 Building...' : '🚀 Generate'}
                </Button>
              </div>
            )}
          </div>

          {/* Build History */}
          {state.buildHistory.length > 0 && (
            <div className="border-t border-gray-700 bg-gray-850 p-3">
              <p className="text-xs font-semibold text-gray-300 mb-2">📋 History</p>
              <div className="space-y-1 max-h-32 overflow-auto">
                {state.buildHistory.slice(-5).map((h, i) => (
                  <div key={i} className="text-xs text-gray-400">
                    <span className="text-gray-500">{h.timestamp}</span> {h.action}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedPuckAIBuilder;
