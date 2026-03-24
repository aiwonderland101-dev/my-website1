'use client';

/**
 * QuadEngineShell - Main Component for AI-WONDERLAND
 * Manages 4 engines: PlayCanvas (3D), WebGL Studio (Shaders), Puck (UI), Theia IDE (Code)
 * Uses next/dynamic with ssr: false for optimal performance
 */

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import '../styles/tie-dye-neon.css';
import { PAGES, getPagesByCategory } from '../lib/navigation';

// Dynamically import engines with ssr: false to prevent server-side issues
const PlayCanvasEngine = dynamic(() => import('./engines/PlayCanvasEngine'), {
  ssr: false,
  loading: () => <EngineLoader engine="PlayCanvas" />,
});

const WebGLStudioEngine = dynamic(() => import('./engines/WebGLStudioEngine'), {
  ssr: false,
  loading: () => <EngineLoader engine="WebGL Studio" />,
});

const PuckUIEngine = dynamic(() => import('./engines/PuckUIEngine'), {
  ssr: false,
  loading: () => <EngineLoader engine="Puck" />,
});

const TheiaIDEEngine = dynamic(() => import('./engines/TheiaIDEEngine'), {
  ssr: false,
  loading: () => <EngineLoader engine="Theia" />,
});

type EngineType = 'playcanvas' | 'webgl' | 'puck' | 'theia';

interface EngineConfig {
  id: EngineType;
  label: string;
  color: string;
  icon: string;
  component: React.ComponentType<any>;
}

const ENGINES: EngineConfig[] = [
  {
    id: 'playcanvas',
    label: 'PlayCanvas 3D',
    color: '#0066ff',
    icon: '🎮',
    component: PlayCanvasEngine,
  },
  {
    id: 'webgl',
    label: 'WebGL Studio',
    color: '#00ff00',
    icon: '✨',
    component: WebGLStudioEngine,
  },
  {
    id: 'puck',
    label: 'Puck UI',
    color: '#ff00ff',
    icon: '📐',
    component: PuckUIEngine,
  },
  {
    id: 'theia',
    label: 'Theia IDE',
    color: '#ff0055',
    icon: '💻',
    component: TheiaIDEEngine,
  },
];

function EngineLoader({ engine }: { engine: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black via-black to-black">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-cyan-500 font-mono text-sm">Loading {engine}...</p>
      </div>
    </div>
  );
}

export function QuadEngineShell() {
  const [activeEngine, setActiveEngine] = useState<EngineType>('playcanvas');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [storageMode, setStorageMode] = useState<'supabase' | 'byoc' | 'hybrid'>('supabase');
  const [engineStates, setEngineStates] = useState<Record<EngineType, any>>({
    playcanvas: null,
    webgl: null,
    puck: null,
    theia: null,
  });

  const currentEngine = ENGINES.find((e) => e.id === activeEngine)!;
  const CurrentEngineComponent = currentEngine.component;

  const handleEngineSwitch = useCallback((engineId: EngineType) => {
    setActiveEngine(engineId);
  }, []);

  const handleSaveEngineState = useCallback((engineId: EngineType, state: any) => {
    setEngineStates((prev) => ({ ...prev, [engineId]: state }));
  }, []);

  useEffect(() => {
    // Keyboard shortcut to toggle sidebar
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Sidebar */}
      <nav
        className={`sidebar-container transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col border-r-2 border-blue-500/50`}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-blue-500/30">
          <h1
            className={`cyberpunk-text text-sm ${
              isSidebarOpen ? 'block' : 'hidden'
            } text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-blue-500 to-green-500`}
          >
            AI-WONDERLAND
          </h1>
          <div className="text-yellow-400 text-xs mt-1 font-mono">
            {isSidebarOpen ? 'v1.0' : 'v'}
          </div>
        </div>

        {/* Engine List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {ENGINES.map((engine) => (
            <button
              key={engine.id}
              onClick={() => handleEngineSwitch(engine.id)}
              className={`sidebar-item w-full text-left text-sm font-mono transition-all ${
                activeEngine === engine.id
                  ? 'active neon-glow-secondary'
                  : 'text-white/60 hover:text-white'
              }`}
              title={engine.label}
            >
              <span className="mr-2">{engine.icon}</span>
              {isSidebarOpen && <span>{engine.label}</span>}
            </button>
          ))}
        </div>

        {/* Storage Mode Indicator */}
        <div
          className={`p-3 border-t-2 border-blue-500/30 text-xs font-mono ${
            storageMode === 'supabase'
              ? 'storage-mode-supabase'
              : storageMode === 'byoc'
                ? 'storage-mode-byoc'
                : 'storage-mode-hybrid'
          }`}
        >
          {isSidebarOpen ? (
            <>
              <div className="text-white/70">Storage:</div>
              <div className="font-bold mt-1">
                {storageMode === 'supabase'
                  ? '☁️ Supabase'
                  : storageMode === 'byoc'
                    ? '🔐 BYOC'
                    : '⚡ Hybrid'}
              </div>
            </>
          ) : (
            <div className="text-center">
              {storageMode === 'supabase' ? '☁️' : storageMode === 'byoc' ? '🔐' : '⚡'}
            </div>
          )}
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="w-full p-3 border-t-2 border-blue-500/30 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {isSidebarOpen ? '◄' : '►'}
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-black via-black to-black">
        {/* Top Bar */}
        <header className="border-b-2 border-blue-500/30 bg-black/80 backdrop-blur p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="engine-active w-3 h-3 rounded-full"
              style={{ boxShadow: `0 0 10px ${currentEngine.color}` }}
            />
            <span className="cyberpunk-text text-xs bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              {currentEngine.label}
            </span>
          </div>

          <div className="flex gap-3">
            <button className="neon-button px-4 py-2" title="Settings (Ctrl+,)">
              ⚙️
            </button>
            <button className="neon-button px-4 py-2" title="Save Project (Ctrl+S)">
              💾
            </button>
            <button className="neon-button px-4 py-2" title="Export (Ctrl+E)">
              📤
            </button>
          </div>
        </header>

        {/* Engine Container */}
        <div className="flex-1 overflow-hidden engine-container active m-2 rounded-lg">
          <CurrentEngineComponent
            engineState={engineStates[activeEngine]}
            onStateChange={(state: any) => handleSaveEngineState(activeEngine, state)}
          />
        </div>

        {/* Status Bar */}
        <footer className="border-t-2 border-blue-500/30 bg-black/80 px-4 py-2 text-xs font-mono text-white/50 flex justify-between">
          <span>🟢 All Engines Ready</span>
          <span>WebGL Memory: 256MB / 512MB</span>
          <span>FPS: 60 | Latency: 5ms</span>
        </footer>
      </main>
    </div>
  );
}
