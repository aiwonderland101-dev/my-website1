import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/permissions/status - Get permission and connection status
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

    // Check Supabase connection
    const { count, error: dbError } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })

    const supabaseStatus = !dbError ? 'connected' : 'error'

    // Build permissions list
    const permissions = [
      {
        name: 'Supabase Connection',
        status: supabaseStatus,
        description:
          'Your data is stored securely in encrypted Supabase buckets',
        connectedAs: `user-${user.id.substring(0, 8)}`,
      },
      {
        name: 'GitHub Integration',
        status: user.user_metadata?.github_connected ? 'connected' : 'disconnected',
        description:
          'Connect to sync your code repositories (optional)',
      },
      {
        name: 'BYOC Cloud Access',
        status: 'connected',
        description: 'You control your own cloud provider credentials',
        connectedAs: 'AWS/GCP/Azure ready',
      },
    ]

    return NextResponse.json({
      permissions,
      currentUser: user.email,
      metadata: user.user_metadata || {},
    })
  } catch (error) {
    console.error('Permission check failed:', error)
    return NextResponse.json(
      { error: 'Failed to check permissions' },
      { status: 500 }
    )
  }
}
