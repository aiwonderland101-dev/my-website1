/**
 * BYOC Export System
 * Bundles scene data as JSON for user download
 * No server requests - everything is client-side
 */

import { PlayCanvasEntity } from './nodeMapper';
import { WebGLStudioNode } from './nodeMapper';

export interface BYOCSceneBundle {
  version: string;
  createdAt: string;
  name: string;
  description?: string;
  playcanvasEntities: PlayCanvasEntity[];
  webglstudioNodes: WebGLStudioNode[];
  metadata: {
    width: number;
    height: number;
    camera?: {
      position: [number, number, number];
      rotation: [number, number, number];
      fov: number;
    };
    lighting?: {
      ambient: [number, number, number];
      directional?: {
        direction: [number, number, number];
        color: [number, number, number];
      };
    };
  };
  settings?: {
    autoSave: boolean;
    syncMode: 'real-time' | 'manual';
    readonly: boolean;
  };
}

export class BYOCExporter {
  private static readonly BUNDLE_VERSION = '1.0.0';
  private static readonly BUNDLE_FORMAT_ID = 'application/vnd.byoc+json';

  /**
   * Create a complete BYOC scene bundle
   */
  static createBundle(
    name: string,
    playcanvasEntities: PlayCanvasEntity[],
    webglstudioNodes: WebGLStudioNode[],
    metadata?: Partial<BYOCSceneBundle['metadata']>,
    description?: string
  ): BYOCSceneBundle {
    return {
      version: this.BUNDLE_VERSION,
      createdAt: new Date().toISOString(),
      name,
      description,
      playcanvasEntities,
      webglstudioNodes,
      metadata: {
        width: metadata?.width || 1920,
        height: metadata?.height || 1080,
        camera: metadata?.camera || {
          position: [0, 5, 10],
          rotation: [0, 0, 0],
          fov: 45,
        },
        lighting: metadata?.lighting || {
          ambient: [0.4, 0.4, 0.4],
        },
      },
      settings: {
        autoSave: false,
        syncMode: 'manual',
        readonly: false,
      },
    };
  }

  /**
   * Export bundle as JSON string (compressed)
   */
  static toJSON(bundle: BYOCSceneBundle, minify = true): string {
    if (minify) {
      return JSON.stringify(bundle);
    }
    return JSON.stringify(bundle, null, 2);
  }

  /**
   * Download bundle as file
   */
  static downloadAsFile(bundle: BYOCSceneBundle, filename?: string): void {
    const jsonString = this.toJSON(bundle, true);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadName = `${filename || bundle.name}_${Date.now()}.byoc.json`;

    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Download bundle as base64-encoded Data URL
   */
  static toDataURL(bundle: BYOCSceneBundle): string {
    const jsonString = this.toJSON(bundle, true);
    const base64 = btoa(jsonString);
    return `data:application/json;base64,${base64}`;
  }

  /**
   * Create a shareable link from bundle
   */
  static createShareLink(bundle: BYOCSceneBundle, baseUrl: string = window.location.origin): string {
    const dataUrl = this.toDataURL(bundle);
    const encodedData = encodeURIComponent(dataUrl);
    return `${baseUrl}/webglstudio/editor?scene=${encodedData}`;
  }

  /**
   * Parse a bundle from JSON string
   */
  static fromJSON(jsonString: string): BYOCSceneBundle {
    try {
      const data = JSON.parse(jsonString);
      this.validateBundle(data);
      return data as BYOCSceneBundle;
    } catch (error) {
      throw new Error(`Failed to parse BYOC bundle: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse a bundle from Data URL
   */
  static fromDataURL(dataUrl: string): BYOCSceneBundle {
    try {
      if (!dataUrl.startsWith('data:')) {
        throw new Error('Invalid data URL format');
      }

      const [header, data] = dataUrl.split(',');
      if (!data) throw new Error('Data URL missing data part');

      let jsonString: string;

      if (header.includes('base64')) {
        jsonString = atob(data);
      } else {
        jsonString = decodeURIComponent(data);
      }

      return this.fromJSON(jsonString);
    } catch (error) {
      throw new Error(`Failed to parse Data URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load bundle from file upload
   */
  static async fromFile(file: File): Promise<BYOCSceneBundle> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const bundle = this.fromJSON(content);
          resolve(bundle);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Validate bundle structure
   */
  private static validateBundle(data: any): void {
    if (!data.version) {
      throw new Error('Bundle missing version');
    }

    if (!data.name) {
      throw new Error('Bundle missing name');
    }

    if (!Array.isArray(data.playcanvasEntities)) {
      throw new Error('Bundle missing playcanvasEntities array');
    }

    if (!Array.isArray(data.webglstudioNodes)) {
      throw new Error('Bundle missing webglstudioNodes array');
    }

    if (!data.metadata) {
      throw new Error('Bundle missing metadata');
    }

    // Version compatibility check
    const [majorVersion] = data.version.split('.').map(Number);
    const [currentMajor] = this.BUNDLE_VERSION.split('.').map(Number);

    if (majorVersion > currentMajor) {
      console.warn(`Bundle version ${data.version} is newer than current ${this.BUNDLE_VERSION}`);
    }
  }

  /**
   * Create a diff between two bundles
   */
  static createDiff(
    oldBundle: BYOCSceneBundle,
    newBundle: BYOCSceneBundle
  ): {
    added: PlayCanvasEntity[];
    removed: PlayCanvasEntity[];
    modified: PlayCanvasEntity[];
    timestamp: string;
  } {
    const oldIds = new Set(oldBundle.playcanvasEntities.map((e) => e.identifier));
    const newIds = new Set(newBundle.playcanvasEntities.map((e) => e.identifier));

    const added = newBundle.playcanvasEntities.filter((e) => !oldIds.has(e.identifier));
    const removed = oldBundle.playcanvasEntities.filter((e) => !newIds.has(e.identifier));

    const modified: PlayCanvasEntity[] = [];
    for (const newEntity of newBundle.playcanvasEntities) {
      if (!oldIds.has(newEntity.identifier)) continue;

      const oldEntity = oldBundle.playcanvasEntities.find((e) => e.identifier === newEntity.identifier);
      if (oldEntity && JSON.stringify(oldEntity) !== JSON.stringify(newEntity)) {
        modified.push(newEntity);
      }
    }

    return {
      added,
      removed,
      modified,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Merge a diff back into a bundle
   */
  static applyDiff(bundle: BYOCSceneBundle, diff: ReturnType<typeof this.createDiff>): BYOCSceneBundle {
    const updated: BYOCSceneBundle = JSON.parse(JSON.stringify(bundle));

    // Remove deleted entities
    updated.playcanvasEntities = updated.playcanvasEntities.filter(
      (e) => !diff.removed.some((r) => r.identifier === e.identifier)
    );

    // Add new entities
    for (const added of diff.added) {
      updated.playcanvasEntities.push(added);
    }

    // Update modified entities
    for (const modified of diff.modified) {
      const index = updated.playcanvasEntities.findIndex((e) => e.identifier === modified.identifier);
      if (index >= 0) {
        updated.playcanvasEntities[index] = modified;
      }
    }

    updated.createdAt = new Date().toISOString();
    return updated;
  }

  /**
   * Generate a scene embedding for analytics
   */
  static generateSceneHash(bundle: BYOCSceneBundle): string {
    const contentString = JSON.stringify({
      entityCount: bundle.playcanvasEntities.length,
      nodeCount: bundle.webglstudioNodes.length,
      hasLighting: !!bundle.metadata.lighting,
      hasCamera: !!bundle.metadata.camera,
    });

    // Simple hash
    let hash = 0;
    for (let i = 0; i < contentString.length; i++) {
      const char = contentString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return `scene_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Create a compressed representation for URL sharing
   */
  static compressForURL(bundle: BYOCSceneBundle): string {
    // Create minimal representation
    const minimal = {
      v: this.BUNDLE_VERSION,
      n: bundle.name,
      e: bundle.playcanvasEntities.length,
      w: bundle.webglstudioNodes.length,
    };

    const json = JSON.stringify(minimal);
    const compressed = btoa(json);

    // URL-safe base64
    return compressed.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /**
   * Export bundle as TypeScript definition (for runtime type checking)
   */
  static generateTypeDefinition(bundle: BYOCSceneBundle): string {
    return`
export interface ImportedScene {
  name: '${bundle.name}';
  version: '${bundle.version}';
  entityCount: ${bundle.playcanvasEntities.length};
  created: '${bundle.createdAt}';
}

export const scene: ImportedScene = {
  name: '${bundle.name}',
  version: '${bundle.version}',
  entityCount: ${bundle.playcanvasEntities.length},
  created: '${bundle.createdAt}',
};
    `.trim();
  }
}
