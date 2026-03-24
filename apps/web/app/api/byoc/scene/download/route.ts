import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/byoc/scene/download?id=<sceneId>
 * Download a BYOC scene as a file
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sceneId = searchParams.get('id');

    if (!sceneId) {
      return NextResponse.json({ error: 'Scene ID required' }, { status: 400 });
    }

    // In a real implementation, fetch from database/BYOC storage
    // For now, return a template
    const sceneData = {
      version: '1.0.0',
      name: `Scene ${sceneId}`,
      createdAt: new Date().toISOString(),
      playcanvasEntities: [],
      webglstudioNodes: [],
      metadata: {
        width: 1920,
        height: 1080,
        camera: {
          position: [0, 5, 10],
          rotation: [0, 0, 0],
          fov: 45,
        },
        lighting: {
          ambient: [0.4, 0.4, 0.4],
        },
      },
    };

    const filename = `${sceneId}_${Date.now()}.byoc.json`;

    return new NextResponse(JSON.stringify(sceneData, null, 2), {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(sceneData)),
      },
    });
  } catch (error) {
    console.error('Failed to download scene:', error);
    return NextResponse.json(
      { error: 'Failed to download scene' },
      { status: 500 }
    );
  }
}
