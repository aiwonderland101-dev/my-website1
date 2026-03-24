/**
 * Theia IDE Component
 */

interface TheiaIDEEngineProps {
  engineState?: any;
  onStateChange?: (state: any) => void;
}

export default function TheiaIDEEngine({ engineState, onStateChange }: TheiaIDEEngineProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-black to-black">
      <div className="text-center space-y-4">
        <div className="text-4xl">💻</div>
        <h2 className="text-2xl font-bold text-red-400">Theia IDE</h2>
        <p className="text-white/60">Code Editor & Development</p>
        <div className="mt-8 space-y-2">
          <button className="neon-button block mx-auto">New File</button>
          <button className="neon-button block mx-auto">Open Folder</button>
          <button className="neon-button block mx-auto">Run Terminal</button>
        </div>
      </div>
    </div>
  );
}