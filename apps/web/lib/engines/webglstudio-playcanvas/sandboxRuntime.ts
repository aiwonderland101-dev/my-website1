/**
 * Sandboxed PlayCanvas Runtime
 * Runs PlayCanvas locally without external requests to playcanvas.com
 * Loads from /public/playcanvas.js
 */

import { PlayCanvasEntity } from './nodeMapper';

export interface SandboxConfig {
  canvasElement: HTMLCanvasElement;
  width: number;
  height: number;
  localAssetsPath: string; // e.g., '/public/playcanvas-assets'
}

export class SandboxedPlayCanvasRuntime {
  private canvas: HTMLCanvasElement;
  private width: number;
  private height: number;
  private localAssetsPath: string;
  private app: any;
  private entities: Map<string, any> = new Map();
  private assetCache: Map<string, any> = new Map();
  private initialized = false;

  constructor(config: SandboxConfig) {
    this.canvas = config.canvasElement;
    this.width = config.width;
    this.height = config.height;
    this.localAssetsPath = config.localAssetsPath;
  }

  /**
   * Initialize the sandboxed PlayCanvas environment
   * Loads local playcanvas.js without any external dependencies
   */
  async initialize(): Promise<void> {
    try {
      // Load local PlayCanvas library
      await this.loadLocalPlayCanvas();

      // Create app with local context
      this.createLocalApp();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize sandboxed PlayCanvas:', error);
      throw error;
    }
  }

  /**
   * Load PlayCanvas library from local /public/playcanvas.js
   */
  private async loadLocalPlayCanvas(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/playcanvas.js';

      // Prevent external requests by intercepting fetch
      const originalFetch = window.fetch;
      (window as any).fetch = (url: string, options?: RequestInit) => {
        // Block all external requests to playcanvas.com
        if (url.includes('playcanvas.com') || url.includes('api.playcanvas.com')) {
          console.warn(`[Sandbox] Blocked external request: ${url}`);
          return Promise.reject(new Error('External requests blocked in sandbox'));
        }
        // Allow local requests
        return originalFetch(url, options);
      };

      script.onload = () => {
        console.log('[Sandbox] PlayCanvas loaded from local /public/playcanvas.js');
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load local PlayCanvas library'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Create a local PlayCanvas app without external dependencies
   */
  private createLocalApp(): void {
    const pc = (window as any).pc;

    if (!pc) {
      throw new Error('PlayCanvas library not found (window.pc)');
    }

    // Create app with no CDN/external dependencies
    this.app = new pc.Application(this.canvas, {
      mouse: new pc.Mouse(this.canvas),
      touch: new pc.TouchDevice(this.canvas),
      elementInput: new pc.ElementInput(this.canvas),
      graphicsDevice: new pc.GraphicsDevice(this.canvas),
    });

    // Set default scene settings
    this.app.scene.ambientLight = [0.4, 0.4, 0.4];

    // Disable all network-based features
    this.disableExternalRequests();
  }

  /**
   * Disable external network requests in the PlayCanvas environment
   */
  private disableExternalRequests(): void {
    const pc = (window as any).pc;

    // Override asset loading to use only local assets
    if (pc.AssetRegistry) {
      const originalLoad = pc.AssetRegistry.prototype.load;
      pc.AssetRegistry.prototype.load = (asset: any) => {
        if (asset.url && asset.url.includes('playcanvas.com')) {
          console.warn(`[Sandbox] Blocked asset download: ${asset.url}`);
          return;
        }
        return originalLoad.call(this, asset);
      };
    }

    // Block HTTP requests
    if (pc.http) {
      pc.http.get = (url: string, ...args: any[]) => {
        if (url.includes('playcanvas.com') || url.includes('api.playcanvas.com')) {
          console.warn(`[Sandbox] Blocked HTTP request: ${url}`);
          return Promise.reject(new Error('External requests blocked'));
        }
        return fetch(url, ...args);
      };
    }
  }

  /**
   * Load a scene from PlayCanvas entity structure
   */
  async loadScene(entities: PlayCanvasEntity[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('Runtime not initialized. Call initialize() first.');
    }

    const pc = (window as any).pc;

    // Clear existing entities
    this.entities.clear();

    // Create entities from structure
    for (const entityData of entities) {
      const entity = await this.createEntity(entityData, this.app.root);
    }

    // Start rendering
    this.app.start();
  }

  /**
   * Create an entity from PlayCanvas entity data
   */
  private async createEntity(data: PlayCanvasEntity, parent: any): Promise<any> {
    const pc = (window as any).pc;

    const entity = new pc.Entity(data.name);

    // Set transform
    if (data.transform) {
      entity.setLocalPosition(...data.transform.position);
      entity.setLocalEulerAngles(...data.transform.rotation);
      entity.setLocalScale(...data.transform.scale);
    }

    // Set enabled state
    entity.enabled = data.enabled !== false;

    // Add components
    if (data.components) {
      for (const [componentName, componentData] of Object.entries(data.components)) {
        await this.addComponent(entity, componentName, componentData);
      }
    }

    // Add children
    if (data.children) {
      for (const childData of data.children) {
        const child = await this.createEntity(childData, entity);
      }
    }

    // Add to parent
    parent.addChild(entity);

    // Cache entity
    this.entities.set(data.identifier, entity);

    return entity;
  }

  /**
   * Add component to entity
   */
  private async addComponent(entity: any, componentName: string, componentData: any): Promise<void> {
    const pc = (window as any).pc;

    switch (componentName) {
      case 'light':
        if (!entity.light) {
          entity.addComponent('light', componentData || {});
        }
        break;

      case 'camera':
        if (!entity.camera) {
          entity.addComponent('camera', componentData || {});
        }
        break;

      case 'model':
        if (!entity.model) {
          entity.addComponent('model', componentData || {});
        }
        break;

      case 'material':
        // Handle custom shader material locally
        if (componentData.shader) {
          await this.createLocalMaterial(entity, componentData);
        }
        break;

      case 'script':
        // For local scripting, we don't load from external sources
        if (componentData.url && !componentData.url.includes('playcanvas.com')) {
          entity.addComponent('script', componentData);
        }
        break;

      default:
        // Store custom data as script attributes
        if (entity.script) {
          entity.script.attributes = componentData;
        }
    }
  }

  /**
   * Create a local material with custom shader
   */
  private async createLocalMaterial(entity: any, materialData: any): Promise<void> {
    const pc = (window as any).pc;

    // Create shader from local definition
    if (materialData.shader) {
      const shaderSource = this.getLocalShader(materialData.shader);

      if (shaderSource) {
        const shader = pc.createShader((window as any).GraphicsDevice, {
          attributes: {
            aPosition: pc.SEMANTIC_POSITION,
            aNormal: pc.SEMANTIC_NORMAL,
            aTexCoord0: pc.SEMANTIC_TEXCOORD0,
          },
          varyings: {
            vNormal: pc.SEMANTIC_NORMAL,
            vTexCoord0: pc.SEMANTIC_TEXCOORD0,
          },
          uniforms: {
            uDiffuseMap: pc.SEMANTIC_DIFFUSE,
            ...materialData.uniforms,
          },
          vertexShader: shaderSource.vertex,
          fragmentShader: shaderSource.fragment,
        });

        const material = new pc.Material('local-shader-material');
        material.shader = shader;
        entity.model.material = material;
      }
    }
  }

  /**
   * Get locally-stored shader source
   */
  private getLocalShader(shaderName: string): { vertex: string; fragment: string } | null {
    // Store shaders locally - can be expanded
    const localShaders: Record<string, { vertex: string; fragment: string }> = {
      'perlin-noise': {
        vertex: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragment: `
          varying vec2 vUv;
          uniform sampler2D uDiffuseMap;
          void main() {
            gl_FragColor = texture2D(uDiffuseMap, vUv);
          }
        `,
      },
      'wave-simulation': {
        vertex: `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec3 pos = position;
            pos.z += sin(pos.x * 5.0 + uTime) * 0.1;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragment: `
          varying vec2 vUv;
          void main() {
            gl_FragColor = vec4(vUv, 1.0, 1.0);
          }
        `,
      },
    };

    return localShaders[shaderName] || null;
  }

  /**
   * Update entity properties in real-time
   */
  updateEntity(entityId: string, updates: Partial<PlayCanvasEntity>): void {
    const entity = this.entities.get(entityId);

    if (!entity) {
      console.warn(`[Sandbox] Entity not found: ${entityId}`);
      return;
    }

    // Update transform
    if (updates.transform) {
      entity.setLocalPosition(...updates.transform.position);
      entity.setLocalEulerAngles(...updates.transform.rotation);
      entity.setLocalScale(...updates.transform.scale);
    }

    // Update enabled state
    if (updates.enabled !== undefined) {
      entity.enabled = updates.enabled;
    }

    // Update name
    if (updates.name) {
      entity.name = updates.name;
    }
  }

  /**
   * Export current scene to JSON
   */
  exportSceneAsJSON(): PlayCanvasEntity[] {
    const entities: PlayCanvasEntity[] = [];

    this.entities.forEach((entity) => {
      const data = this.entityToJSON(entity);
      if (data) entities.push(data);
    });

    return entities;
  }

  /**
   * Convert PlayCanvas entity to JSON
   */
  private entityToJSON(entity: any): PlayCanvasEntity | null {
    if (!entity) return null;

    const data: PlayCanvasEntity = {
      identifier: entity.getGuid ? entity.getGuid() : entity.name,
      name: entity.name,
      type: entity.light ? 'light' : entity.camera ? 'camera' : 'model',
      enabled: entity.enabled,
      tags: (entity.tags || []).split(','),
    };

    // Get transform
    const pos = entity.getLocalPosition?.();
    const rot = entity.getLocalEulerAngles?.();
    const scale = entity.getLocalScale?.();

    if (pos && rot && scale) {
      data.transform = {
        position: [pos.x, pos.y, pos.z],
        rotation: [rot.x, rot.y, rot.z],
        scale: [scale.x, scale.y, scale.z],
      };
    }

    // Get children
    const children = entity.children || [];
    if (children.length > 0) {
      data.children = children.map((child: any) => this.entityToJSON(child)).filter(Boolean) as PlayCanvasEntity[];
    }

    return data;
  }

  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    if (this.app && this.app.resizeCanvas) {
      this.app.resizeCanvas(width, height);
    }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.app) {
      this.app.destroy();
    }
    this.entities.clear();
    this.assetCache.clear();
    this.initialized = false;
  }

  /**
   * Get entity by ID
   */
  getEntity(entityId: string): any {
    return this.entities.get(entityId);
  }

  /**
   * Get all entities
   */
  getAllEntities(): Array<[string, any]> {
    return Array.from(this.entities.entries());
  }
}
