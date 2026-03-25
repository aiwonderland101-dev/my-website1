import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/user/preferences - Save user preferences
// GET /api/user/preferences - Get user preferences
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

    const preferences = await req.json()

    // Save to user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        preferences,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences saved',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookie = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookie })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      preferences: user.user_metadata?.preferences || {},
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}
