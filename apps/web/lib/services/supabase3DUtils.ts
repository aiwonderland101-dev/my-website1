/**
 * Supabase 3D Utilities
 *
 * Handles signed URL generation for GLB and thumbnail assets,
 * and provides behavior injection logic for PlayCanvas entities.
 */

import { supabase } from '@/lib/supabaseClient';

/**
 * Generates a signed URL for a Supabase storage asset
 * @param bucketName - The bucket name ('assets' for GLB, 'thumbnails' for PNG)
 * @param fileName - The file name/path in the bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 */
export async function generateSignedUrl(
  bucketName: 'assets' | 'thumbnails',
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, expiresIn);

    if (error) {
      console.error(`Failed to generate signed URL for ${bucketName}/${fileName}:`, error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned from Supabase');
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * Generates signed URLs for both GLB and thumbnail assets
 * @param glbFileName - The GLB file name in the 'assets' bucket
 * @param thumbnailFileName - The thumbnail file name in the 'thumbnails' bucket
 * @param expiresIn - Expiration time in seconds
 */
export async function generateAssetUrls(
  glbFileName: string,
  thumbnailFileName: string,
  expiresIn: number = 3600
): Promise<{ glbUrl: string; thumbnailUrl: string }> {
  try {
    const [glbUrl, thumbnailUrl] = await Promise.all([
      generateSignedUrl('assets', glbFileName, expiresIn),
      generateSignedUrl('thumbnails', thumbnailFileName, expiresIn),
    ]);

    return { glbUrl, thumbnailUrl };
  } catch (error) {
    console.error('Error generating asset URLs:', error);
    throw error;
  }
}

/**
 * Injects AI logic/behavior into a PlayCanvas entity
 * @param entity - The PlayCanvas entity
 * @param scriptContent - The logic code/script content to inject
 * @param scriptName - Optional name for the script component
 */
export function injectAILogic(
  entity: any,
  scriptContent: string,
  scriptName: string = 'AIBehavior'
): void {
  if (!entity) {
    console.warn('Cannot inject AI logic: entity is null or undefined');
    return;
  }

  try {
    // Create a new script component
    const scriptComponent = entity.addComponent('script');

    if (!scriptComponent) {
      throw new Error('Failed to add script component to entity');
    }

    // Create a function from the script content
    // This is a safe way to execute the logic in the context of the entity
    const behaviorFunction = new Function('entity', 'pc', scriptContent);

    // Store the logic as a method on the entity for later execution
    (entity as any)[scriptName] = behaviorFunction;

    // If the script component has an enabled state, enable it
    if (typeof scriptComponent.enabled === 'boolean') {
      scriptComponent.enabled = true;
    }

    console.log(`AI logic injected into entity with script name: ${scriptName}`);
  } catch (error) {
    console.error('Error injecting AI logic:', error);
    throw error;
  }
}

/**
 * Safely injects AI logic with error handling
 */
export function injectAILogicSafe(
  entity: any,
  scriptContent: string,
  scriptName: string = 'AIBehavior'
): boolean {
  try {
    injectAILogic(entity, scriptContent, scriptName);
    return true;
  } catch (error) {
    console.error('Failed to inject AI logic safely:', error);
    return false;
  }
}

/**
 * Detects available GPU memory
 * Returns the available GPU memory in MB, or null if detection fails
 */
export function detectGPUMemory(): number | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      console.warn('WebGL not available');
      return null;
    }

    // Try to get GPU memory info via WebGL extensions
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) {
      ext.loseContext();
    }

    // Check for debugInfo extension (non-standard but widely supported)
    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      console.log('GPU Renderer:', unmaskedRenderer);
      // This is for information; actual memory detection is browser-dependent
    }

    // Try to estimate available memory by attempting large texture allocation
    let maxMemory = 0;
    const testSizes = [2048, 4096, 8192, 16384]; // Texture dimensions

    for (const size of testSizes) {
      try {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        if (gl.getError() === gl.NO_ERROR) {
          // Rough estimation: size * size * 4 bytes (RGBA) / (1024 * 1024) for MB
          maxMemory = (size * size * 4) / (1024 * 1024);
        } else {
          break;
        }

        gl.deleteTexture(texture);
      } catch (e) {
        break;
      }
    }

    return maxMemory > 0 ? maxMemory : null;
  } catch (error) {
    console.error('Error detecting GPU memory:', error);
    return null;
  }
}

/**
 * Checks if the device has low GPU memory
 * @param thresholdMB - Threshold in MB below which to consider memory low (default: 512MB)
 */
export function hasLowGPUMemory(thresholdMB: number = 512): boolean {
  const gpuMemory = detectGPUMemory();

  if (gpuMemory === null) {
    // If detection fails, assume it's a low-memory device
    console.warn('Could not detect GPU memory, assuming low memory device');
    return true;
  }

  return gpuMemory < thresholdMB;
}

/**
 * Checks device performance capabilities
 */
export function getDeviceCapabilities() {
  return {
    hasLowGPUMemory: hasLowGPUMemory(),
    gpuMemoryMB: detectGPUMemory() ?? 0,
    maxTextureSize: getMaxTextureSize(),
    supportsWebGL2: !!window.WebGL2RenderingContext,
  };
}

/**
 * Gets the maximum texture size supported by WebGL
 */
function getMaxTextureSize(): number {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return 0;
    }

    return gl.getParameter(gl.MAX_TEXTURE_SIZE);
  } catch (error) {
    console.error('Error getting max texture size:', error);
    return 0;
  }
}
