/**
 * Unified Editor Configuration
 * Customize node types, shaders, export settings, etc.
 */

export const UnifiedEditorConfig = {
  /**
   * Supported WebGL Studio node types
   */
  webglStudioNodeTypes: [
    'geometry',
    'light',
    'camera',
    'particle',
    'shader',
    'group',
  ] as const,

  /**
   * Supported PlayCanvas entity types
   */
  playcanvasEntityTypes: [
    'model',
    'light',
    'camera',
    'particlesystem',
    'entity',
  ] as const,

  /**
   * Local shader library
   * Add more shaders here for your scenes
   */
  localShaders: {
    'perlin-noise': {
      name: 'Perlin Noise',
      description: 'Generates Perlin noise patterns',
      vertex: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        varying vec2 vUv;
        uniform sampler2D uNoiseTexture;
        
        float noise(vec2 p) {
          return texture2D(uNoiseTexture, p).r;
        }
        
        void main() {
          float n = noise(vUv * 5.0);
          gl_FragColor = vec4(vec3(n), 1.0);
        }
      `,
      uniforms: {
        uNoiseTexture: { type: 'texture' },
        uScale: { type: 'float', default: 1.0 },
        uOctaves: { type: 'int', default: 4 },
      },
    },

    'wave-simulation': {
      name: 'Wave Simulation',
      description: 'Simulates water wave displacement',
      vertex: `
        uniform float uTime;
        uniform float uWaveAmplitude;
        uniform float uWaveFrequency;
        
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vec3 pos = position;
          
          // Calculate wave displacement
          float wave = sin(pos.x * uWaveFrequency + uTime) * uWaveAmplitude;
          wave += sin(pos.z * uWaveFrequency * 0.5 + uTime * 0.5) * uWaveAmplitude * 0.5;
          
          pos.y += wave;
          
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragment: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vec3 color = mix(uColor1, uColor2, vUv.y);
          
          // Simple lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diffuse = max(dot(vNormal, lightDir), 0.0);
          
          gl_FragColor = vec4(color * (0.3 + diffuse * 0.7), 1.0);
        }
      `,
      uniforms: {
        uTime: { type: 'float', default: 0.0 },
        uWaveAmplitude: { type: 'float', default: 0.5 },
        uWaveFrequency: { type: 'float', default: 2.0 },
        uColor1: { type: 'vec3', default: [0.0, 0.5, 1.0] },
        uColor2: { type: 'vec3', default: [0.0, 0.2, 0.5] },
      },
    },

    'mandelbrot': {
      name: 'Mandelbrot Set',
      description: 'Renders Mandelbrot fractal',
      vertex: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        uniform float uZoom;
        uniform vec2 uOffset;
        uniform int uIterations;
        
        varying vec2 vUv;
        
        vec3 palette(float t) {
          return mix(
            vec3(0.0, 0.0, 0.5),
            vec3(1.0, 1.0, 0.0),
            t
          );
        }
        
        float mandelbrot(vec2 c) {
          vec2 z = vec2(0.0);
          for (int i = 0; i < 256; i++) {
            if (dot(z, z) > 4.0) {
              return float(i) / 256.0;
            }
            z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
          }
          return 1.0;
        }
        
        void main() {
          vec2 c = (vUv - 0.5) * uZoom + uOffset;
          float m = mandelbrot(c);
          vec3 color = palette(m);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        uZoom: { type: 'float', default: 3.0 },
        uOffset: { type: 'vec2', default: [0.0, 0.0] },
        uIterations: { type: 'int', default: 256 },
      },
    },

    'cellular-automata': {
      name: 'Cellular Automata',
      description: 'Conway Game of Life on GPU',
      vertex: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        uniform sampler2D uPreviousState;
        uniform vec2 uGridSize;
        
        varying vec2 vUv;
        
        float neighbors(vec2 uv) {
          float n = 0.0;
          vec2 step = 1.0 / uGridSize;
          
          for (int i = -1; i <= 1; i++) {
            for (int j = -1; j <= 1; j++) {
              if (i == 0 && j == 0) continue;
              vec2 offset = vec2(float(i), float(j)) * step;
              n += texture2D(uPreviousState, uv + offset).r;
            }
          }
          
          return n;
        }
        
        void main() {
          float alive = texture2D(uPreviousState, vUv).r;
          float n = neighbors(vUv);
          
          float newAlive = 0.0;
          if (alive > 0.5) {
            // Cell is alive
            if (n >= 2.0 && n <= 3.0) {
              newAlive = 1.0;  // Survives
            }
          } else {
            // Cell is dead
            if (n == 3.0) {
              newAlive = 1.0;  // Birth
            }
          }
          
          gl_FragColor = vec4(vec3(newAlive), 1.0);
        }
      `,
      uniforms: {
        uPreviousState: { type: 'texture' },
        uGridSize: { type: 'vec2', default: [512.0, 512.0] },
      },
    },
  },

  /**
   * Property synchronization settings
   */
  syncProperties: {
    position: { sync: true, precision: 3 },
    rotation: { sync: true, precision: 3 },
    scale: { sync: true, precision: 3 },
    visible: { sync: true, precision: 0 },
  },

  /**
   * Export settings
   */
  export: {
    version: '1.0.0',
    minify: true,
    includeMetadata: true,
    includeSettings: true,
    maxBundleSize: 50 * 1024 * 1024, // 50MB
  },

  /**
   * Performance settings
   */
  performance: {
    maxEntities: 1000,
    maxNodes: 1000,
    syncFrameInterval: 60, // Frames between syncs in real-time mode
    autoSaveInterval: 30000, // Milliseconds
    renderTarget: 'canvas', // 'canvas' or 'offscreen'
  },

  /**
   * Sandbox settings
   */
  sandbox: {
    blockExternalRequests: true,
    blockPlayCanvasAPI: true,
    allowLocalStorage: true,
    allowIndexedDB: false,
    allowWebWorkers: true,
  },

  /**
   * Asset management
   */
  assets: {
    localPath: '/public/playcanvas-assets',
    maxTextureSize: 2048,
    compressionLevel: 'medium', // 'low' | 'medium' | 'high'
    cacheSize: 100 * 1024 * 1024, // 100MB
  },

  /**
   * Lighting presets
   */
  lightingPresets: {
    default: {
      ambient: [0.4, 0.4, 0.4],
      directional: {
        direction: [1, 1, 1],
        color: [0.8, 0.8, 0.8],
        intensity: 1.0,
      },
    },
    bright: {
      ambient: [0.6, 0.6, 0.6],
      directional: {
        direction: [1, 1, 1],
        color: [1.0, 1.0, 1.0],
        intensity: 1.5,
      },
    },
    dark: {
      ambient: [0.2, 0.2, 0.2],
      directional: {
        direction: [1, 1, 1],
        color: [0.5, 0.5, 0.5],
        intensity: 0.5,
      },
    },
  },

  /**
   * Camera presets
   */
  cameraPresets: {
    default: {
      position: [0, 5, 10],
      rotation: [0, 0, 0],
      fov: 45,
    },
    topdown: {
      position: [0, 20, 0],
      rotation: [-Math.PI / 2, 0, 0],
      fov: 45,
    },
    closeup: {
      position: [0, 1, 3],
      rotation: [0, 0, 0],
      fov: 60,
    },
  },

  /**
   * Keyboard shortcuts
   */
  shortcuts: {
    'Ctrl+S': 'save',
    'Ctrl+E': 'export',
    'Ctrl+L': 'load',
    'Ctrl+Z': 'undo',
    'Ctrl+Shift+Z': 'redo',
    'Space': 'play',
    'Escape': 'deselect',
  },

  /**
   * UI customization
   */
  ui: {
    theme: 'dark', // 'light' | 'dark'
    showGrid: true,
    gridSize: 1,
    showAxis: true,
    enableGizmos: true,
  },
};

/**
 * Type-safe config accessor
 */
export function getConfig<K extends keyof typeof UnifiedEditorConfig>(key: K) {
  return UnifiedEditorConfig[key];
}

/**
 * Merge custom config with defaults
 */
export function mergeConfig(custom: Partial<typeof UnifiedEditorConfig>) {
  return {
    ...UnifiedEditorConfig,
    ...custom,
  };
}
