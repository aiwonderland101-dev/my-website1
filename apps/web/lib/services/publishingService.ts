/**
 * PlayCanvas Publishing Service
 *
 * Handles capturing thumbnails, uploading assets to Supabase storage,
 * and publishing products to the community library.
 */

import { supabase } from '@/lib/supabaseClient';

export interface PublishProductData {
  productName: string;
  logicCode: string;
  glbBlob: Blob;
}

/**
 * Captures a thumbnail from the current PlayCanvas canvas
 */
export async function captureThumbnail(): Promise<Blob> {
  // Find the PlayCanvas canvas element
  const canvas = document.querySelector('canvas[data-playcanvas]') as HTMLCanvasElement;

  if (!canvas) {
    // Try alternative selectors for PlayCanvas canvas
    const altCanvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!altCanvas) {
      throw new Error('PlayCanvas canvas not found. Make sure the PlayCanvas editor is loaded.');
    }
    canvas = altCanvas;
  }

  // Create a new canvas for thumbnail generation
  const thumbnailCanvas = document.createElement('canvas');
  const ctx = thumbnailCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context for thumbnail generation');
  }

  // Set thumbnail size (square aspect ratio)
  const thumbnailSize = 256;
  thumbnailCanvas.width = thumbnailSize;
  thumbnailCanvas.height = thumbnailSize;

  // Calculate scaling to fit the canvas content
  const scale = Math.min(thumbnailSize / canvas.width, thumbnailSize / canvas.height);
  const scaledWidth = canvas.width * scale;
  const scaledHeight = canvas.height * scale;

  // Center the scaled content
  const offsetX = (thumbnailSize - scaledWidth) / 2;
  const offsetY = (thumbnailSize - scaledHeight) / 2;

  // Draw the scaled canvas content
  ctx.drawImage(canvas, offsetX, offsetY, scaledWidth, scaledHeight);

  // Convert to blob
  return new Promise((resolve, reject) => {
    thumbnailCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to generate thumbnail blob'));
      }
    }, 'image/png', 0.9);
  });
}

/**
 * Uploads a GLB file to Supabase storage
 */
async function uploadGLB(glbBlob: Blob): Promise<string> {
  const timestamp = Date.now();
  const fileName = `product_${timestamp}.glb`;

  const { data, error } = await supabase.storage
    .from('assets')
    .upload(fileName, glbBlob, {
      contentType: 'model/gltf-binary',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload GLB: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('assets')
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded GLB');
  }

  return urlData.publicUrl;
}

/**
 * Uploads a thumbnail image to Supabase storage
 */
async function uploadThumbnail(thumbnailBlob: Blob): Promise<string> {
  const timestamp = Date.now();
  const fileName = `thumbnail_${timestamp}.png`;

  const { data, error } = await supabase.storage
    .from('thumbnails')
    .upload(fileName, thumbnailBlob, {
      contentType: 'image/png',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload thumbnail: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('thumbnails')
    .getPublicUrl(fileName);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded thumbnail');
  }

  return urlData.publicUrl;
}

/**
 * Inserts a product into the community_library table
 */
async function insertProductToLibrary(
  productName: string,
  logicCode: string,
  assetUrl: string,
  thumbnailUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('community_library')
    .insert({
      product_name: productName,
      logic_code: logicCode,
      asset_url: assetUrl,
      thumbnail_url: thumbnailUrl,
      created_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Failed to insert product into library: ${error.message}`);
  }
}

/**
 * Publishes a PlayCanvas product to the community library
 *
 * @param productData - The product data to publish
 * @returns Promise that resolves when publishing is complete
 */
export async function publishProduct(productData: PublishProductData): Promise<void> {
  try {
    // Step 1: Capture thumbnail
    console.log('📸 Capturing thumbnail...');
    const thumbnailBlob = await captureThumbnail();

    // Step 2: Upload GLB asset
    console.log('📤 Uploading GLB asset...');
    const assetUrl = await uploadGLB(productData.glbBlob);

    // Step 3: Upload thumbnail
    console.log('🖼️ Uploading thumbnail...');
    const thumbnailUrl = await uploadThumbnail(thumbnailBlob);

    // Step 4: Insert into database
    console.log('💾 Saving to community library...');
    await insertProductToLibrary(
      productData.productName,
      productData.logicCode,
      assetUrl,
      thumbnailUrl
    );

    console.log('✅ Product published successfully!');
    console.log('Asset URL:', assetUrl);
    console.log('Thumbnail URL:', thumbnailUrl);

  } catch (error) {
    console.error('❌ Failed to publish product:', error);
    throw error;
  }
}

/**
 * Hook for using the publishing service with React state
 */
export function usePublishingService() {
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const publish = React.useCallback(async (productData: PublishProductData) => {
    setIsPublishing(true);
    setError(null);

    try {
      await publishProduct(productData);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, []);

  return {
    publish,
    isPublishing,
    error,
  };
}

// Import React for the hook
import React from 'react';