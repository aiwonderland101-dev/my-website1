import { NextRequest, NextResponse } from 'next/server';
import { BYOCSceneBundle } from '@/lib/engines/webglstudio-playcanvas/byocExporter';

/**
 * GET /api/byoc/scene?id=<sceneId>
 * Fetch a BYOC scene bundle
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sceneId = searchParams.get('id');

    if (!sceneId) {
      return NextResponse.json({ error: 'Scene ID required' }, { status: 400 });
    }

    // In a real implementation, fetch from database or BYOC storage
    // For now, return a placeholder
    const bundle: Partial<BYOCSceneBundle> = {
      version: '1.0.0',
      name: `Scene ${sceneId}`,
      playcanvasEntities: [],
      webglstudioNodes: [],
    };

    return NextResponse.json(bundle);
  } catch (error) {
    console.error('Failed to fetch scene:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scene' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/byoc/scene
 * Save a BYOC scene bundle
 */
export async function POST(req: NextRequest) {
  try {
    const bundle: BYOCSceneBundle = await req.json();

    // Validate bundle
    if (!bundle.name || !bundle.playcanvasEntities || !bundle.webglstudioNodes) {
      return NextResponse.json(
        { error: 'Invalid scene bundle' },
        { status: 400 }
      );
    }

    // In a real implementation:
    // 1. Store in database
    // 2. If BYOC enabled, upload to user's cloud storage
    // 3. Return scene ID

    const sceneId = `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[BYOC] Scene saved: ${sceneId}`, {
      name: bundle.name,
      entities: bundle.playcanvasEntities.length,
      nodes: bundle.webglstudioNodes.length,
    });

    return NextResponse.json({
      success: true,
      sceneId,
      url: `/api/byoc/scene?id=${sceneId}`,
      downloadUrl: `/api/byoc/scene/download?id=${sceneId}`,
      shareUrl: `/webglstudio/editor?scene=${sceneId}`,
    });
  } catch (error) {
    console.error('Failed to save scene:', error);
    return NextResponse.json(
      { error: 'Failed to save scene' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/byoc/scene
 * Update a BYOC scene bundle (merge changes)
 */
export async function PUT(req: NextRequest) {
  try {
    const { sceneId, changes } = await req.json();

    if (!sceneId) {
      return NextResponse.json(
        { error: 'Scene ID required' },
        { status: 400 }
      );
    }

    // In a real implementation, apply diffs/merge changes
    console.log(`[BYOC] Scene updated: ${sceneId}`, {
      changes: Object.keys(changes || {}),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      sceneId,
      updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update scene:', error);
    return NextResponse.json(
      { error: 'Failed to update scene' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/byoc/scene?id=<sceneId>
 * Delete a BYOC scene bundle
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sceneId = searchParams.get('id');

    if (!sceneId) {
      return NextResponse.json(
        { error: 'Scene ID required' },
        { status: 400 }
      );
    }

    console.log(`[BYOC] Scene deleted: ${sceneId}`);

    return NextResponse.json({
      success: true,
      sceneId,
    });
  } catch (error) {
    console.error('Failed to delete scene:', error);
    return NextResponse.json(
      { error: 'Failed to delete scene' },
      { status: 500 }
    );
  }
}
