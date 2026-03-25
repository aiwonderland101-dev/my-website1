'use client';

import { useMemo } from 'react';
import { BuilderStoreProvider, useBuilderStore } from './BuilderStore';
import { ResizablePanel } from './ResizablePanel';
import PuckUIEngine from './PuckUIEngine';
import PlayCanvasEngine from './PlayCanvasEngine';
import TheiaIDEEngine from './TheiaIDEEngine';

function InnerWorkspace() {
  const { scene, setScene, script, setScript, selectedEntityId, setSelectedEntityId } = useBuilderStore();

  const mergedScene = useMemo(() => scene, [scene]);

  return (
    <div className="h-screen w-screen bg-[#05060b] p-2">
      <div className="flex h-full min-h-0">
        <ResizablePanel initialWidth={320} minWidth={240} maxWidth={440} className="flex-shrink-0">
          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/25">
            <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80">
              <span>Puck No-Code</span>
              <span className="text-xs text-sky-300">Visual ↔ Store</span>
            </div>
            <div className="flex-1 min-h-0 p-2">
              <PuckUIEngine
                scene={mergedScene}
                onSceneChange={(nextScene) => {
                  setScene(nextScene);
                  setSelectedEntityId(nextScene.entities[0]?.id ?? null);
                }}
              />
            </div>
          </div>
        </ResizablePanel>

        <main className="flex-1 flex flex-col overflow-hidden ml-2 mr-2">
          <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80">
            <span>PlayCanvas Renderer</span>
            <span className="text-xs text-cyan-300">Store → 3D</span>
          </div>
          <div className="flex-1 min-h-0 p-2">
            <PlayCanvasEngine
              scene={mergedScene}
              script={script}
              onSceneUpdate={(nextScene) => setScene(nextScene)}
              onEntitySelected={(entityId) => setSelectedEntityId(entityId)}
              onStatus={(status) => console.debug('PlayCanvas status', status)}
            />
          </div>
        </main>

        <ResizablePanel initialWidth={420} minWidth={340} maxWidth={520} className="flex-shrink-0">
          <section className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/25">
            <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-3 py-2 text-sm text-white/80">
              <span>Theia Code</span>
              <span className="text-xs text-lime-300">Code ↔ Store</span>
            </div>
            <div className="flex-1 min-h-0 p-2">
              <TheiaIDEEngine script={script} onScriptSave={(next) => setScript(next)} />
            </div>
          </section>
        </ResizablePanel>
      </div>
    </div>
  );
}

export default function MainWorkspace() {
  return (
    <BuilderStoreProvider>
      <InnerWorkspace />
    </BuilderStoreProvider>
  );
}
