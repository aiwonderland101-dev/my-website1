/**
 * Maps WebGLStudio Nodes to PlayCanvas Entities
 * Provides bidirectional conversion between both formats
 */

export interface WebGLStudioNode {
  id: string;
  name: string;
  type: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  properties?: Record<string, any>;
  children?: WebGLStudioNode[];
  shader?: string;
  uniforms?: Record<string, any>;
  visible?: boolean;
}

export interface PlayCanvasEntity {
  identifier: string;
  name: string;
  type: string;
  transform?: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  components?: Record<string, any>;
  children?: PlayCanvasEntity[];
  tags?: string[];
  enabled?: boolean;
}

export interface IntegratedSceneNode extends WebGLStudioNode {
  playcanvasEntityId?: string;
  syncedProperties?: Set<string>;
}

export class NodeMapper {
  /**
   * Convert a WebGLStudio node to a PlayCanvas entity
   */
  static toPlayCanvasEntity(node: WebGLStudioNode, parentId?: string): PlayCanvasEntity {
    const entity: PlayCanvasEntity = {
      identifier: node.id,
      name: node.name || `Entity_${node.id}`,
      type: this.mapNodeType(node.type),
      enabled: node.visible !== false,
      tags: [node.type, 'webglstudio-imported'],
    };

    // Map transform
    if (node.position || node.rotation || node.scale) {
      entity.transform = {
        position: node.position || [0, 0, 0],
        rotation: node.rotation || [0, 0, 0],
        scale: node.scale || [1, 1, 1],
      };
    }

    // Map components based on node type
    entity.components = this.mapNodeProperties(node);

    // Recursively convert children
    if (node.children && node.children.length > 0) {
      entity.children = node.children.map((child) =>
        this.toPlayCanvasEntity(child, node.id)
      );
    }

    return entity;
  }

  /**
   * Convert a PlayCanvas entity back to a WebGLStudio node
   */
  static toWebGLStudioNode(entity: PlayCanvasEntity): WebGLStudioNode {
    const node: WebGLStudioNode = {
      id: entity.identifier,
      name: entity.name,
      type: this.mapEntityType(entity.type),
      visible: entity.enabled !== false,
    };

    // Map transform
    if (entity.transform) {
      node.position = entity.transform.position;
      node.rotation = entity.transform.rotation;
      node.scale = entity.transform.scale;
    }

    // Map properties from components
    if (entity.components) {
      node.properties = { ...entity.components };
    }

    // Recursively convert children
    if (entity.children && entity.children.length > 0) {
      node.children = entity.children.map((child) => this.toWebGLStudioNode(child));
    }

    return node;
  }

  /**
   * Map WebGLStudio node types to PlayCanvas component types
   */
  private static mapNodeType(nodeType: string): string {
    const typeMap: Record<string, string> = {
      geometry: 'model',
      light: 'light',
      camera: 'camera',
      particle: 'particlesystem',
      shader: 'model',
      group: 'entity',
    };
    return typeMap[nodeType] || nodeType;
  }

  /**
   * Map PlayCanvas entity types back to WebGLStudio node types
   */
  private static mapEntityType(entityType: string): string {
    const typeMap: Record<string, string> = {
      model: 'geometry',
      light: 'light',
      camera: 'camera',
      particlesystem: 'particle',
      entity: 'group',
    };
    return typeMap[entityType] || entityType;
  }

  /**
   * Convert node properties to PlayCanvas components
   */
  private static mapNodeProperties(node: WebGLStudioNode): Record<string, any> {
    const components: Record<string, any> = {};

    if (!node.properties) return components;

    // Map shader as material component
    if (node.shader) {
      components.material = {
        type: 'custom',
        shader: node.shader,
        uniforms: node.uniforms || {},
      };
    }

    // Copy other properties as custom data
    for (const [key, value] of Object.entries(node.properties)) {
      if (key !== 'shader' && key !== 'uniforms') {
        components[key] = value;
      }
    }

    return components;
  }

  /**
   * Merge an integrated scene from both editors
   */
  static mergeScenes(webglNodes: WebGLStudioNode[], playcanvasEntities: PlayCanvasEntity[]): IntegratedSceneNode[] {
    const merged: IntegratedSceneNode[] = [];

    // First, add all WebGL nodes
    for (const node of webglNodes) {
      const integrated: IntegratedSceneNode = {
        ...node,
        syncedProperties: new Set(['position', 'rotation', 'scale', 'visible']),
      };

      // Try to find matching PlayCanvas entity
      const matchingEntity = this.findMatchingEntity(node, playcanvasEntities);
      if (matchingEntity) {
        integrated.playcanvasEntityId = matchingEntity.identifier;
        // Merge transform data
        if (matchingEntity.transform) {
          integrated.position = matchingEntity.transform.position;
          integrated.rotation = matchingEntity.transform.rotation;
          integrated.scale = matchingEntity.transform.scale;
        }
      }

      merged.push(integrated);
    }

    // Add any PlayCanvas entities not in WebGL
    for (const entity of playcanvasEntities) {
      if (!merged.find((n) => n.playcanvasEntityId === entity.identifier)) {
        const converted = this.toWebGLStudioNode(entity);
        const integrated: IntegratedSceneNode = {
          ...converted,
          playcanvasEntityId: entity.identifier,
          syncedProperties: new Set(['position', 'rotation', 'scale', 'visible']),
        };
        merged.push(integrated);
      }
    }

    return merged;
  }

  /**
   * Find a matching PlayCanvas entity for a WebGL node
   */
  private static findMatchingEntity(
    node: WebGLStudioNode,
    entities: PlayCanvasEntity[]
  ): PlayCanvasEntity | undefined {
    return (
      entities.find((e) => e.identifier === node.id || e.name === node.name) ||
      entities.find((e) => e.name.includes(node.name))
    );
  }

  /**
   * Create a synchronized copy with bidirectional updates
   */
  static createSyncProxy(
    node: IntegratedSceneNode,
    onWebGLUpdate: (node: IntegratedSceneNode) => void,
    onPlayCanvasUpdate: (entity: PlayCanvasEntity) => void
  ): {
    node: IntegratedSceneNode;
    updateFromWebGL: (updates: Partial<WebGLStudioNode>) => void;
    updateFromPlayCanvas: (updates: Partial<PlayCanvasEntity>) => void;
  } {
    const syncNode = { ...node };

    return {
      node: syncNode,

      updateFromWebGL: (updates: Partial<WebGLStudioNode>) => {
        Object.assign(syncNode, updates);
        onWebGLUpdate(syncNode);

        // Propagate to PlayCanvas if they're synced
        if (syncNode.playcanvasEntityId && syncNode.syncedProperties?.size) {
          const pcEntity = this.toPlayCanvasEntity(syncNode, syncNode.playcanvasEntityId);
          onPlayCanvasUpdate(pcEntity);
        }
      },

      updateFromPlayCanvas: (updates: Partial<PlayCanvasEntity>) => {
        if (syncNode.playcanvasEntityId === updates.identifier) {
          if (updates.transform) {
            syncNode.position = updates.transform.position;
            syncNode.rotation = updates.transform.rotation;
            syncNode.scale = updates.transform.scale;
          }
          if (updates.enabled !== undefined) {
            syncNode.visible = updates.enabled;
          }
          onPlayCanvasUpdate(updates as PlayCanvasEntity);
        }
      },
    };
  }
}
