'use client';

import React, { useState } from 'react';
import UnifiedWebGLStudioPlayCanvasEditor from '@/components/UnifiedWebGLStudioPlayCanvasEditor';
import { BYOCSceneBundle } from '@/lib/engines/webglstudio-playcanvas/byocExporter';

export default function UnifiedEditorPage() {
  const [currentBundle, setCurrentBundle] = useState<BYOCSceneBundle | null>(null);

  const handleSceneChange = (bundle: BYOCSceneBundle) => {
    setCurrentBundle(bundle);
    console.log('Scene updated:', {
      name: bundle.name,
      entities: bundle.playcanvasEntities.length,
      nodes: bundle.webglstudioNodes.length,
      timestamp: bundle.createdAt,
    });

    // Optional: Persist to local storage for recovery
    try {
      localStorage.setItem('current-scene-bundle', JSON.stringify(bundle));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  };

  return (
    <div className="w-full h-screen">
      <UnifiedWebGLStudioPlayCanvasEditor onSceneChange={handleSceneChange} readOnly={false} />
    </div>
  );
}
