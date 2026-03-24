'use client';

import React, { useEffect, useState } from 'react';
import UnifiedPuckAIBuilder from '@/components/UnifiedPuckAIBuilder';
import { useUnifiedBuilder } from '@/lib/hooks/useUnifiedBuilder';

export default function UnifiedPuckAIPage() {
  const [mounted, setMounted] = useState(false);
  const [savedContent, setSavedContent] = useState<any>(null);

  const builder = useUnifiedBuilder({
    initialContent: savedContent || {
      root: {
        type: 'root',
        props: {},
        children: [],
      },
    },
    onContentChange: (content) => {
      // You could persist to localStorage here
      try {
        localStorage.setItem('puck_current_page', JSON.stringify(content));
      } catch (e) {
        console.warn('Could not save to localStorage:', e);
      }
    },
    onHistoryChange: (history) => {
      console.log(`[Builder] ${history.length} actions recorded`);
    },
    autoSave: true,
    autoSaveInterval: 30000,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('puck_current_page');
      if (saved) {
        setSavedContent(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-gray-300 text-lg">Loading editor...</div>
      </div>
    );
  }

  return (
    <UnifiedPuckAIBuilder
      initialContent={builder.content}
      onSave={(content) => {
        console.log('Saving:', content);
        // Implement your save logic here (API call, etc.)
      }}
      mode="edit"
    />
  );
}
