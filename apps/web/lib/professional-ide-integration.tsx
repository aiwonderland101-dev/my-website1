'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useGhostText, GhostTextOverlay } from '@/lib/ghost-text-predictor'
import { usePlayCanvasLiveSync, LiveSyncPanel } from '@/lib/playcanvas-live-sync'
import { useOracleSpatialAnalysis, OracleSidePanel } from '@/lib/oracle-spatial-analyzer'
import { ConnectionStatusIndicator } from '@/lib/sovereign-connection-monitor'
import { AssetStorePanel } from '@/lib/playcanvas-asset-store'

/**
 * Complete "World Class" IDE Integration
 * 
 * This component integrates all professional 2026 IDE features:
 * 1. Ghost Text (AI code predictions)
 * 2. Live Sync (3D ↔ Code bridge)
 * 3. Oracle Inspector (spatial analysis)
 * 4. Sovereign Connection Monitor (status)
 * 5. Asset Store (PlayCanvas API integration)
 */
interface ProfessionalIDEProps {
  projectId: string
  sceneId?: string
  editorElement?: HTMLElement | null
}

export function ProfessionalIDEIntegration({
  projectId,
  sceneId,
  editorElement,
}: ProfessionalIDEProps) {
  // Ghost Text
  const { suggestion, onCodeChange, onAccept } = useGhostText()
  const [cursorPos, setCursorPos] = useState({ top: 0, left: 0 })

  // Live Sync
  const { latestChange, sceneJson } = usePlayCanvasLiveSync()

  // Oracle Spatial Analysis
  const { issues } = useOracleSpatialAnalysis()

  // Connection Status
  const statusRef = useRef<HTMLDivElement>(null)

  // Setup editor listeners for ghost text
  useEffect(() => {
    if (!editorElement) return

    const handleKeyUp = (e: KeyboardEvent) => {
      const editor = editorElement as any

      // Get cursor position
      if (editor.getPosition) {
        const pos = editor.getPosition()
        const coords = editor.getScrolledVisiblePosition(pos)

        if (coords) {
          setCursorPos({
            top: coords.top,
            left: coords.left,
          })
        }

        // Get code context
        const code = editor.getValue()
        onCodeChange(code, pos.lineNumber - 1, pos.column - 1)
      }
    }

    editorElement.addEventListener('keyup', handleKeyUp)
    return () => editorElement.removeEventListener('keyup', handleKeyUp)
  }, [editorElement, onCodeChange])

  return (
    <div className="relative w-full h-full flex">
      {/* Main Editor Area */}
      <div className="flex-1 relative">
        {/* Ghost Text Overlay */}
        <GhostTextOverlay
          cursorTop={cursorPos.top}
          cursorLeft={cursorPos.left}
          suggestion={suggestion}
          onAccept={onAccept}
        />

        {/* Editor placeholder */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Editor content rendered here */}
        </div>
      </div>

      {/* Right Sidebar: Oracle Inspector */}
      <div className="w-80 border-l bg-white flex flex-col">
        <OracleSidePanel
          entities={
            sceneJson.entities || []
          }
          onGoToLine={(line) => {
            console.log('Jump to line:', line)
          }}
        />
      </div>

      {/* Bottom Right: Asset Store Panel */}
      <div className="absolute bottom-4 right-4 w-96 max-h-80">
        <AssetStorePanel projectId={projectId} compact={false} />
      </div>

      {/* Bottom Left: Live Sync Monitor */}
      <div className="absolute bottom-4 left-4 w-96 max-h-64 bg-white border rounded-lg shadow-lg">
        <LiveSyncPanel show={true} />
      </div>

      {/* Top Right: Connection Status */}
      <div className="absolute top-4 right-4 z-10">
        <ConnectionStatusIndicator size="md" showTooltip={true} />
      </div>
    </div>
  )
}

/**
 * Integration documentation and setup guide
 */
export const PROFESSIONAL_IDE_SETUP = {
  ghostText: {
    description: 'AI-powered code predictions with debouncing',
    features: [
      'Real-time multi-line suggestions (last 20 lines sent to AI)',
      'Low-opacity ghost text at cursor position',
      'Accept with Tab key (2026 magic feeling)',
      'Uses Gemini 2.0 Flash for speed',
      'Cost tracking integrated',
    ],
    integration: `
// In your Theia or Monaco editor:
import { useGhostText } from '@/lib/ghost-text-predictor'

const { suggestion, onCodeChange, onAccept } = useGhostText()

editor.onDidChangeModelContent(() => {
  const position = editor.getPosition()
  const code = editor.getValue()
  onCodeChange(code, position.lineNumber - 1, position.column - 1)
})

editor.onDidChangeCursorPosition((e) => {
  const cursorPos = editor.getPosition()
  // Update ghost text position
})
    `,
  },

  liveSync: {
    description: 'Real-time 3D scene ↔ code synchronization',
    features: [
      'Detects PlayCanvas entity changes (position, rotation, scale)',
      'Auto-syncs to scene.json in real-time',
      'Displays change notifications',
      'Shows entity transform data in code side-panel',
      'WebSocket-ready for collaborative editing',
    ],
    integration: `
// In PlayCanvas editor iframe:
window.addEventListener('message', (e) => {
  if (e.data.type === 'SETUP_SYNC_LISTENER') {
    // Attach listeners to all entities
    root.findByName('entity-name').on('attributechange', (name, value) => {
      window.parent.postMessage({
        type: 'SYNC_TO_CODE',
        id: entity.guid,
        name: entity.name,
        data: { [name]: value }
      }, '*')
    })
  }
})
    `,
  },

  oracleInspector: {
    description: 'Spatial analysis and layout validation',
    features: [
      'AABB bounding box detection',
      'Overlap detection (collision warnings)',
      'Off-screen element detection',
      'Too-small-to-click warnings (accessibility)',
      'Invisible entity tracking',
      'Clickable code navigation to issues',
    ],
    integration: `
// Get entities from PlayCanvas or scene.json
const entities = sceneJson.entities.map(e => ({
  id: e.id,
  name: e.name,
  aabb: calculateAABB(e),
  position: e.position,
  scale: e.scale,
  visible: e.visible
}))

// Analyzer runs automatically
useOracleSpatialAnalysis()
    `,
  },

  sovereignConnection: {
    description: 'Connection status with pulse indicator',
    features: [
      'Green pulse: Connected to GitHub/Supabase',
      'Yellow pulse: Offline/Local mode',
      'Red pulse: Token expired (redirect to auth)',
      'Checks every 30 seconds',
      'Detailed connection details popover',
    ],
    integration: `
import { ConnectionStatusIndicator } from '@/lib/sovereign-connection-monitor'

// Render in header
<ConnectionStatusIndicator size="md" showTooltip={true} />

// Use hook for custom logic
const { state, derivedStatus } = useSovereignConnection()
    `,
  },

  assetStore: {
    description: 'Instant asset injection via PlayCanvas API',
    features: [
      'Browse available 3D models, materials, prefabs',
      'One-click purchase + instant injection',
      'Assets appear immediately in PlayCanvas Assets panel',
      'Custom asset store integration',
      'Billing integration ready',
    ],
    integration: `
import { AssetStorePanel } from '@/lib/playcanvas-asset-store'

// In your dashboard
<AssetStorePanel projectId={projectId} compact={false} />

// Lifecycle:
// 1. User clicks "Inject" on asset
// 2. Backend records purchase
// 3. Asset uploaded to user's Supabase bucket
// 4. calls PlayCanvas REST API to create asset
// 5. PlayCanvas iframe refreshes assets panel
// 6. Asset appears instantly in 3D viewport
    `,
  },
}
