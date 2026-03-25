'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export type SceneEntity = {
  id: string;
  name: string;
  type: 'box' | 'sphere' | 'cylinder' | 'plane' | 'custom';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
};

export type SceneState = {
  entities: SceneEntity[];
};

type BuilderStoreContextType = {
  scene: SceneState;
  script: string;
  selectedEntityId: string | null;
  setScene: (scene: SceneState) => void;
  setScript: (script: string) => void;
  setSelectedEntityId: (id: string | null) => void;
};

const DEFAULT_SCENE: SceneState = { entities: [] };

const BuilderStoreContext = createContext<BuilderStoreContextType | undefined>(undefined);

export function BuilderStoreProvider({ children }: { children: React.ReactNode }) {
  const [scene, setScene] = useState<SceneState>(DEFAULT_SCENE);
  const [script, setScript] = useState<string>(`// Start typing your game logic here\nconsole.log('BuilderStore loaded');`);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const value = useMemo(
    () => ({ scene, script, selectedEntityId, setScene, setScript, setSelectedEntityId }),
    [scene, script, selectedEntityId],
  );

  return <BuilderStoreContext.Provider value={value}>{children}</BuilderStoreContext.Provider>;
}

export function useBuilderStore(): BuilderStoreContextType {
  const context = useContext(BuilderStoreContext);
  if (!context) {
    throw new Error('useBuilderStore must be used within a BuilderStoreProvider');
  }
  return context;
}
