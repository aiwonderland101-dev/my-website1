/**
 * WonderSpace Default Starter Scene
 * 
 * Provides a beautiful, ready-to-customize 3D environment for new PlayCanvas projects.
 * Features a psychedelic lighting setup and collision-enabled ground plane.
 */

export interface EntityDefinition {
  name: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  components: {
    render?: { type: 'box' | 'capsule' | 'sphere' | 'cylinder' | 'cone' }
    light?: {
      type: 'directional' | 'point' | 'spot'
      color: [number, number, number]
      intensity?: number
      castShadows?: boolean
    }
    collision?: {
      type: 'box' | 'sphere' | 'capsule' | 'cylinder'
      halfExtents?: [number, number, number]
    }
    script?: {
      enabled: boolean
      scripts?: string[]
    }
  }
  material?: {
    pbr?: {
      baseColor: [number, number, number]
      metallic?: number
      roughness?: number
    }
  }
}

export interface DefaultScene {
  scene_name: string
  entities: Record<string, EntityDefinition>
}

/**
 * WonderSpace Core Starter Scene - Psychedelic Colors, Physics-Ready
 * Perfect for new users to start building immediately
 */
export const WONDERSPACE_STARTER_SCENE: DefaultScene = {
  scene_name: 'WonderSpace_Starter_Core',
  entities: {
    world_floor: {
      name: 'World Floor',
      position: [0, -0.5, 0],
      scale: [20, 1, 20],
      components: {
        render: { type: 'box' },
        collision: { type: 'box', halfExtents: [10, 0.5, 10] }
      },
      material: {
        pbr: {
          baseColor: [0.05, 0.05, 0.05], // Murder-black
          metallic: 0.9,
          roughness: 0.1
        }
      }
    },
    psychedelic_sun: {
      name: 'Psychedelic Sun',
      position: [5, 10, 5],
      rotation: [45, 45, 0],
      components: {
        light: {
          type: 'directional',
          color: [0.4, 0.0, 0.9], // Blue-Purple gradient
          intensity: 1.5,
          castShadows: true
        }
      }
    },
    spawn_point: {
      name: 'Player Spawn',
      position: [0, 1, 0],
      components: {
        render: { type: 'capsule' },
        script: { enabled: true, scripts: ['playerController'] }
      }
    }
  }
}

/**
 * Create a PlayCanvas entity from a definition
 * This function translates the simple JSON definition into PlayCanvas API calls
 */
export function createEntityFromDefinition(
  app: any, // pc.Application
  definition: EntityDefinition,
  parentEntity?: any
): any {
  const entity = new (window as any).pc.Entity(definition.name || 'Entity');
  
  // Set transform
  entity.setLocalPosition(...definition.position);
  if (definition.rotation) {
    entity.setLocalEulerAngles(...definition.rotation);
  }
  if (definition.scale) {
    entity.setLocalScale(...definition.scale);
  }

  // Add render component
  if (definition.components.render) {
    const primType = definition.components.render.type.toUpperCase();
    entity.addComponent('render', {
      type: primType
    });

    // Apply material
    if (definition.material?.pbr) {
      const material = new (window as any).pc.StandardMaterial();
      const [r, g, b] = definition.material.pbr.baseColor;
      
      material.diffuse = new (window as any).pc.Color(r, g, b);
      material.metalness = definition.material.pbr.metallic ?? 0;
      material.shininess = 100 * (1 - (definition.material.pbr.roughness ?? 0.5));
      
      entity.render.materialAsset = material;
    }
  }

  // Add light component
  if (definition.components.light) {
    const light = definition.components.light;
    entity.addComponent('light', {
      type: light.type,
      color: new (window as any).pc.Color(...light.color),
      intensity: light.intensity ?? 1,
      castShadows: light.castShadows ?? false
    });
  }

  // Add collision component
  if (definition.components.collision) {
    const collision = definition.components.collision;
    entity.addComponent('collision', {
      type: collision.type,
      halfExtents: collision.halfExtents
        ? new (window as any).pc.Vec3(...collision.halfExtents)
        : new (window as any).pc.Vec3(0.5, 0.5, 0.5)
    });
  }

  // Add rigidbody for physics (if collision exists)
  if (definition.components.collision) {
    entity.addComponent('rigidbody', {
      type: 'static',
      restitution: 0.5,
      friction: 0.8
    });
  }

  // Add to scene
  if (parentEntity) {
    parentEntity.addChild(entity);
  } else if (app && app.root) {
    app.root.addChild(entity);
  }

  return entity;
}

/**
 * Inject the default WonderSpace scene into a PlayCanvas application
 */
export function injectDefaultScene(app: any, scene: DefaultScene = WONDERSPACE_STARTER_SCENE): any[] {
  if (!app || !app.root) {
    console.error('Invalid PlayCanvas application provided');
    return [];
  }

  const entities: any[] = [];

  // Create all entities from definitions
  for (const [key, definition] of Object.entries(scene.entities)) {
    try {
      const entity = createEntityFromDefinition(app, { name: key, ...definition });
      entities.push(entity);
    } catch (error) {
      console.error(`Failed to create entity ${key}:`, error);
    }
  }

  // Enable shadows on the app
  if (app.scene && app.scene.shadowMap) {
    app.scene.shadowMap.type = 1; // PCF3x3
  }

  return entities;
}

/**
 * Alternative simple version using raw PlayCanvas entity creation
 * for compatibility with different PlayCanvas versions
 */
export function createSimpleStarterScene(app: any): any[] {
  const entities: any[] = [];

  try {
    const Entity = (window as any).pc.Entity;
    
    // Create ground
    const ground = new Entity('World Floor');
    ground.setLocalPosition(0, -0.5, 0);
    ground.setLocalScale(20, 1, 20);
    
    if (Entity.prototype.addComponent) {
      ground.addComponent('render', { type: 'BOX' });
      ground.addComponent('collision', { type: 'BOX' });
      ground.addComponent('rigidbody', { type: 'static' });
    }
    
    app.root.addChild(ground);
    entities.push(ground);

    // Create light
    const light = new Entity('Psychedelic Sun');
    light.setLocalPosition(5, 10, 5);
    light.setLocalEulerAngles(45, 45, 0);
    
    if (Entity.prototype.addComponent) {
      light.addComponent('light', {
        type: 'directional',
        intensity: 1.5,
        castShadows: true
      });
    }
    
    app.root.addChild(light);
    entities.push(light);

    // Create spawn point
    const spawn = new Entity('Player Spawn');
    spawn.setLocalPosition(0, 1, 0);
    
    if (Entity.prototype.addComponent) {
      spawn.addComponent('render', { type: 'CAPSULE' });
    }
    
    app.root.addChild(spawn);
    entities.push(spawn);

  } catch (error) {
    console.error('Failed to create starter scene:', error);
  }

  return entities;
}
