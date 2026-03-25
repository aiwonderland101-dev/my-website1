'use client'

import { Info } from 'lucide-react'

export function StarterSceneInfo() {
  return (
    <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4 mb-4 flex gap-3">
      <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
      <div className="space-y-1 text-sm">
        <p className="text-purple-200 font-semibold">✨ WonderSpace Starter Scene Loaded</p>
        <p className="text-purple-300/80">
          Your scene includes a physics-enabled ground floor, psychedelic directional lighting, and a spawn point ready for your game logic.
        </p>
        <div className="text-xs text-purple-300/60 mt-2 flex gap-4">
          <span>🎮 Play, edit, or export</span>
          <span>💡 Customize lighting & materials</span>
          <span>🚀 Add your own entities</span>
        </div>
      </div>
    </div>
  )
}
