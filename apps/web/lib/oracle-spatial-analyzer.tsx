'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Eye, Volume3, Layers } from 'lucide-react'

interface AABB {
  min: { x: number; y: number; z: number }
  max: { x: number; y: number; z: number }
}

interface Entity {
  id: string
  name: string
  aabb?: AABB
  position: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  visible: boolean
}

interface SpatialIssue {
  type: 'overlap' | 'offscreen' | 'scale' | 'visibility' | 'performance'
  severity: 'error' | 'warning' | 'info'
  entityIds: string[]
  entityNames: string[]
  description: string
  codeLineHint?: number
  fix?: string
}

/**
 * Oracle spatial analyzer
 * Detects overlapping objects, off-screen elements, scale issues, etc.
 */
export class OracleSpatialAnalyzer {
  private static instance: OracleSpatialAnalyzer
  private listeners: Set<(issues: SpatialIssue[]) => void> = new Set()
  private entities: Map<string, Entity> = new Map()
  private viewportSize = { width: 1920, height: 1080 }

  private constructor() {}

  static getInstance(): OracleSpatialAnalyzer {
    if (!OracleSpatialAnalyzer.instance) {
      OracleSpatialAnalyzer.instance = new OracleSpatialAnalyzer()
    }
    return OracleSpatialAnalyzer.instance
  }

  /**
   * Set viewport dimensions for off-screen detection
   */
  setViewport(width: number, height: number) {
    this.viewportSize = { width, height }
  }

  /**
   * Update entity data and analyze
   */
  updateEntities(entities: Entity[]) {
    entities.forEach((e) => this.entities.set(e.id, e))
    this.analyzeScene()
  }

  private analyzeScene() {
    const issues: SpatialIssue[] = []

    // Check for overlaps
    const overlaps = this.checkForOverlaps()
    issues.push(...overlaps)

    // Check for off-screen elements
    const offScreen = this.checkForOffScreenObjects()
    issues.push(...offScreen)

    // Check for small clickable elements
    const small = this.checkForSmallElements()
    issues.push(...small)

    // Check for invisible entities
    const invisible = this.checkForInvisibleEntities()
    issues.push(...invisible)

    this.notifyListeners(issues)
  }

  private checkForOverlaps(): SpatialIssue[] {
    const issues: SpatialIssue[] = []
    const entities = Array.from(this.entities.values())

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const e1 = entities[i]
        const e2 = entities[j]

        if (e1.aabb && e2.aabb && this.aabbIntersect(e1.aabb, e2.aabb)) {
          issues.push({
            type: 'overlap',
            severity: 'warning',
            entityIds: [e1.id, e2.id],
            entityNames: [e1.name, e2.name],
            description: `Objects "${e1.name}" and "${e2.name}" are overlapping in 3D space`,
            fix: `Adjust position of ${e1.name} or ${e2.name} to prevent collision`,
          })
        }
      }
    }

    return issues
  }

  private checkForOffScreenObjects(): SpatialIssue[] {
    const issues: SpatialIssue[] = []

    for (const entity of this.entities.values()) {
      if (!entity.visible) continue

      const { x, y } = entity.position

      // Simple 2D off-screen check (projects 3D position to screen)
      const screenX = (x / 50) * this.viewportSize.width
      const screenY = (y / 50) * this.viewportSize.height

      const margin = 50
      if (
        screenX < -margin ||
        screenX > this.viewportSize.width + margin ||
        screenY < -margin ||
        screenY > this.viewportSize.height + margin
      ) {
        issues.push({
          type: 'offscreen',
          severity: 'warning',
          entityIds: [entity.id],
          entityNames: [entity.name],
          description: `"${entity.name}" is positioned off-screen and won't be visible to users`,
          fix: `Move ${entity.name} to position within visible bounds (x: 0-${this.viewportSize.width}, y: 0-${this.viewportSize.height})`,
        })
      }
    }

    return issues
  }

  private checkForSmallElements(): SpatialIssue[] {
    const issues: SpatialIssue[] = []
    const MIN_CLICKABLE_SIZE = 20 // pixels

    for (const entity of this.entities.values()) {
      if (!entity.aabb || !entity.visible) continue

      const width = entity.aabb.max.x - entity.aabb.min.x
      const height = entity.aabb.max.y - entity.aabb.min.y

      if (width < MIN_CLICKABLE_SIZE || height < MIN_CLICKABLE_SIZE) {
        issues.push({
          type: 'scale',
          severity: 'warning',
          entityIds: [entity.id],
          entityNames: [entity.name],
          description: `"${entity.name}" is too small to click reliably (${width}x${height} pixels)`,
          fix: `Increase scale of ${entity.name} to at least ${MIN_CLICKABLE_SIZE}x${MIN_CLICKABLE_SIZE} pixels`,
        })
      }
    }

    return issues
  }

  private checkForInvisibleEntities(): SpatialIssue[] {
    const issues: SpatialIssue[] = []

    for (const entity of this.entities.values()) {
      if (!entity.visible && entity.name && !entity.name.includes('hidden')) {
        issues.push({
          type: 'visibility',
          severity: 'info',
          entityIds: [entity.id],
          entityNames: [entity.name],
          description: `"${entity.name}" is hidden (may be intentional)`,
          fix: `Ensure ${entity.name} should be hidden, or set visible = true`,
        })
      }
    }

    return issues
  }

  private aabbIntersect(a: AABB, b: AABB): boolean {
    return !(
      a.max.x < b.min.x ||
      a.min.x > b.max.x ||
      a.max.y < b.min.y ||
      a.min.y > b.max.y ||
      a.max.z < b.min.z ||
      a.min.z > b.max.z
    )
  }

  subscribe(callback: (issues: SpatialIssue[]) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(issues: SpatialIssue[]) {
    this.listeners.forEach((cb) => cb(issues))
  }
}

/**
 * React hook
 */
export function useOracleSpatialAnalysis() {
  const [issues, setIssues] = useState<SpatialIssue[]>([])
  const analyzer = React.useRef(OracleSpatialAnalyzer.getInstance())

  useEffect(() => {
    const unsubscribe = analyzer.current.subscribe(setIssues)
    return unsubscribe
  }, [])

  const updateEntities = useCallback((entities: Entity[]) => {
    analyzer.current.updateEntities(entities)
  }, [])

  return { issues, updateEntities }
}

/**
 * Oracle Inspector Panel (Right sidebar)
 */
interface OracleSidePanelProps {
  entities?: Entity[]
  onGoToLine?: (line: number) => void
}

export function OracleSidePanel({
  entities = [],
  onGoToLine,
}: OracleSidePanelProps) {
  const { issues, updateEntities } = useOracleSpatialAnalysis()

  useEffect(() => {
    if (entities.length > 0) {
      updateEntities(entities)
    }
  }, [entities, updateEntities])

  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length

  return (
    <Card className="h-full border-l flex flex-col">
      <CardHeader className="border-b py-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4 text-purple-600" />
          Oracle Insight
        </CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          {errorCount > 0 && (
            <Badge className="bg-red-100 text-red-800 mr-2">
              {errorCount} error
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge className="bg-amber-100 text-amber-800 mr-2">
              {warningCount} warning
            </Badge>
          )}
          {errorCount === 0 && warningCount === 0 && (
            <Badge className="bg-green-100 text-green-800">All clear ✓</Badge>
          )}
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto py-3 space-y-3">
        {issues.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-8">
            <Volume3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>No spatial issues detected</p>
          </div>
        ) : (
          issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs ${
                issue.severity === 'error'
                  ? 'bg-red-50 border-red-200'
                  : issue.severity === 'warning'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    issue.severity === 'error'
                      ? 'text-red-600'
                      : issue.severity === 'warning'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-semibold">{issue.type}</p>
                  <p className="mt-1 text-gray-700">{issue.description}</p>
                  {issue.fix && (
                    <p className="mt-2 text-gray-600 italic">💡 {issue.fix}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {issue.entityNames.map((name) => (
                      <Badge
                        key={name}
                        variant="outline"
                        className="text-xs bg-white"
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                  {issue.codeLineHint && (
                    <button
                      onClick={() => onGoToLine?.(issue.codeLineHint!)}
                      className="text-xs text-blue-600 hover:underline mt-2"
                    >
                      Jump to line {issue.codeLineHint}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <div className="border-t p-3 bg-purple-50">
        <p className="text-xs font-semibold text-purple-900">
          🎯 Oracle Guidance
        </p>
        <p className="text-xs text-purple-700 mt-1">
          {entities.length} entities analyzed • Ready for export
        </p>
      </div>
    </Card>
  )
}
