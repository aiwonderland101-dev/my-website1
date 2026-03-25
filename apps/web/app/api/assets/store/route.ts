import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Mock asset store database
const STORE_ASSETS = [
  {
    id: 'asset-robot-001',
    name: 'Robot Character (Animated)',
    description: 'Rigged humanoid robot with walk cycle',
    category: 'model',
    fileUrl: 'https://example.com/assets/robot-animated.glb',
    fileType: 'glb',
    fileSize: 2.5 * 1024 * 1024,
    previewUrl: 'https://example.com/previews/robot.jpg',
    price: 29.99,
    rating: 4.8,
    creator: 'RobotStudio',
  },
  {
    id: 'asset-scifi-materials',
    name: 'Sci-Fi Material Pack',
    description: '12 futuristic materials (metallic, neon, holographic)',
    category: 'material',
    fileUrl: 'https://example.com/assets/scifi-materials.zip',
    fileType: 'webp',
    fileSize: 15 * 1024 * 1024,
    previewUrl: 'https://example.com/previews/materials.jpg',
    price: 19.99,
    rating: 4.6,
    creator: 'MaterialFactory',
  },
  {
    id: 'asset-city-env',
    name: 'Urban Environment',
    description: 'Full city block with buildings, streets, vegetation',
    category: 'prefab',
    fileUrl: 'https://example.com/assets/city-block.gltf',
    fileType: 'gltf',
    fileSize: 45 * 1024 * 1024,
    previewUrl: 'https://example.com/previews/city.jpg',
    price: 59.99,
    rating: 4.9,
    creator: 'EnvironmentPro',
  },
  {
    id: 'asset-neon-signs',
    name: 'Neon Sign Pack',
    description: '20 customizable neon signs (text, shapes, colors)',
    category: 'prefab',
    fileUrl: 'https://example.com/assets/neon-signs.glb',
    fileType: 'glb',
    fileSize: 8 * 1024 * 1024,
    previewUrl: 'https://example.com/previews/neon.jpg',
    price: 24.99,
    rating: 4.7,
    creator: 'NeonDesigns',
  },
]

// GET /api/assets/store - List available assets
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      assets: STORE_ASSETS,
      total: STORE_ASSETS.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

// POST /api/assets/purchase - Record purchase
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

    const { assetId, projectId } = await req.json()

    // Record purchase in database
    const { error } = await supabase.from('asset_purchases').insert({
      user_id: user.id,
      asset_id: assetId,
      project_id: projectId,
      purchased_at: new Date().toISOString(),
    })

    if (error) {
      console.warn('Failed to record purchase:', error)
      // Don't fail - asset injection is more important
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase recorded',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Purchase recording failed' },
      { status: 500 }
    )
  }
}
