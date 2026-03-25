import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/assets/upload - Upload asset file to Supabase
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

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bucketName = 'assets'
    const fileName = `${user.id}/${Date.now()}-${file.name}`

    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(data.path)

    // Log asset upload (fire-and-forget)
    try {
      await supabase.from('asset_uploads').insert({
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        bucket_path: data.path,
        public_url: publicUrl,
      })
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json({
      success: true,
      path: data.path,
      publicUrl,
      fileName: file.name,
    })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    )
  }
}
