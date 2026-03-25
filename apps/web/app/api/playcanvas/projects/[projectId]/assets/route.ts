import { NextRequest, NextResponse } from 'next/server'

// POST /api/playcanvas/projects/[projectId]/assets
// Injects an asset into a PlayCanvas project using their REST API
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params
    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Call PlayCanvas REST API to create asset
    // https://developer.playcanvas.com/en/api/projects/
    const playCanvasApiUrl = `https://api.playcanvas.com/projects/${projectId}/assets`

    const response = await fetch(playCanvasApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        name: body.name,
        type: body.type || 'model', // 'model', 'material', 'texture', etc
        source: body.source || 'url',
        data: {
          url: body.meta?.url,
          filename: body.name,
        },
        meta: body.meta || {},
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[PlayCanvas API] Injection failed:', error)

      return NextResponse.json(
        {
          error: `PlayCanvas API error: ${response.status}`,
          details: error,
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      asset: data,
      message: `Asset "${body.name}" injected into PlayCanvas project`,
    })
  } catch (error) {
    console.error('[PlayCanvas Injection] Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Asset injection failed',
      },
      { status: 500 }
    )
  }
}
