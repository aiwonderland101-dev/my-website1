'use client';

import { useEffect, useRef, useState } from 'react';
import * as pc from 'playcanvas';
import { SceneEntity, SceneState } from './BuilderStore';

type EngineStatus = 'loading' | 'ready' | 'error';

interface PlayCanvasEngineProps {
  scene: SceneState;
  script: string;
  onSceneUpdate?: (scene: SceneState) => void;
  onStatus?: (status: EngineStatus) => void;
  onEntitySelected?: (entityId: string | null) => void;
}

const defaultScene: SceneState = { entities: [] };

export default function PlayCanvasEngine({ scene = defaultScene, script, onSceneUpdate, onStatus, onEntitySelected }: PlayCanvasEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<pc.Application | null>(null);
  const rootRef = useRef<pc.Entity | null>(null);
  const [status, setStatus] = useState<EngineStatus>('loading');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const buildScene = (sceneState: SceneState) => {
    if (!rootRef.current) return;

    const root = rootRef.current;
    root.children.forEach((child) => root.removeChild(child));

    sceneState.entities.forEach((entity) => {
      const node = new pc.Entity(entity.id);
      node.addComponent('model', { type: entity.type === 'sphere' ? 'sphere' : entity.type === 'cylinder' ? 'cylinder' : entity.type === 'plane' ? 'plane' : 'box' });
      node.setPosition(entity.position.x, entity.position.y, entity.position.z);
      node.setEulerAngles(entity.rotation.x, entity.rotation.y, entity.rotation.z);
      node.setLocalScale(entity.scale.x, entity.scale.y, entity.scale.z);

      if (entity.color) {
        const material = new pc.StandardMaterial();
        material.diffuse = new pc.Color().fromString(entity.color);
        material.update();
        node.model!.meshInstances[0].material = material;
      }

      node.on('mousedown', () => {
        setSelectedId(entity.id);
        onEntitySelected?.(entity.id);
      });

      root.addChild(node);
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const app = new pc.Application(canvasRef.current, { graphicsDeviceOptions: { preserveDrawingBuffer: true, antialias: true } });

    appRef.current = app;

    const camera = new pc.Entity('Camera');
    camera.addComponent('camera', { clearColor: new pc.Color(0.1, 0.1, 0.13) });
    camera.setPosition(0, 1.8, 5);
    app.root.addChild(camera);

    const light = new pc.Entity('Light');
    light.addComponent('light', { type: 'directional', intensity: 1.3 });
    light.setEulerAngles(45, 35, 0);
    app.root.addChild(light);

    const sceneRoot = new pc.Entity('SceneRoot');
    app.root.addChild(sceneRoot);
    rootRef.current = sceneRoot;

    app.start();

    setStatus('ready');
    onStatus?.('ready');

    return () => {
      app.destroy();
      appRef.current = null;
      rootRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status !== 'ready' || !rootRef.current) return;
    buildScene(scene);
  }, [scene, status]);

  useEffect(() => {
    if (status !== 'ready' || !appRef.current || !script) return;
    // Simple script hot-reload: if the code contains `spin`, rotate all entities.
    const onUpdate = (dt: number) => {
      if (!script.includes('spin')) return;
      if (!rootRef.current) return;
      rootRef.current.children.forEach((child) => {
        child.rotate(0, 20 * dt, 0);
      });
    };

    appRef.current.on('update', onUpdate);

    return () => {
      appRef.current?.off('update', onUpdate);
    };
  }, [script, status]);

  const nudgeSelected = () => {
    if (!selectedId) return;
    const active = scene.entities.find((e) => e.id === selectedId);
    if (!active) return;
    const updatedScene = {
      entities: scene.entities.map((e) =>
        e.id === selectedId ? {
          ...e,
          position: { x: e.position.x + 0.2, y: e.position.y, z: e.position.z },
        } : e,
      ),
    };
    onSceneUpdate?.(updatedScene);
  };

  return (
    <div className="relative h-full w-full rounded-xl border border-sky-500/30 bg-black/30 overflow-hidden">
      <div className="absolute z-20 right-2 top-2 flex gap-2">
        <button onClick={nudgeSelected} className="rounded border border-cyan-400/60 px-2 py-1 text-xs text-cyan-200 hover:bg-cyan-500/10">
          nudge ↘
        </button>
        <div className="rounded bg-black/70 px-2 py-1 text-xs text-white/80">{status}</div>
      </div>

      <canvas ref={canvasRef} className="h-full w-full" />

      <div className="absolute left-2 bottom-2 rounded bg-black/70 px-2 py-1 text-xs text-white/80">
        Selected: {selectedId ?? 'none'}
      </div>
    </div>
  );
}
