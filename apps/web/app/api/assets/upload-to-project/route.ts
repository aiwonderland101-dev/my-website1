import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST /api/assets/upload-to-project - Upload purchased asset to user's project
export async function POST(req: NextRequest) {
  try {
    const cookie = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookie })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assetUrl, fileName, projectId } = await req.json()

    // Download asset from source
    const assetResponse = await fetch(assetUrl)
    if (!assetResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download asset' },
        { status: 400 }
      )
    }

    const assetBuffer = await assetResponse.arrayBuffer()
    const uint8Array = new Uint8Array(assetBuffer)

    // Upload to user's project bucket
    const bucketPath = `projects/${projectId}/assets/${fileName}`

    const { data, error } = await supabase.storage
      .from('assets')
      .upload(bucketPath, uint8Array, {
        contentType: assetResponse.headers.get('content-type') || 'application/octet-stream',
        upsert: true,
      })

    if (error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 400 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('assets').getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      bucketPath: data.path,
      publicUrl,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    )
  }
}
