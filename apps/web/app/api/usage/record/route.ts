import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/usage/record - Record API usage for cost tracking
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

    const usage = await req.json()

    // Insert usage record into database
    const { error } = await supabase.from('api_usage').insert({
      user_id: user.id,
      model: usage.model,
      provider: usage.provider,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      cost_usd: usage.costUSD,
      timestamp: new Date(usage.timestamp).toISOString(),
    })

    if (error && error.code !== 'PGRST116') {
      // Ignore if table doesn't exist yet
      console.warn('Failed to record usage:', error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Silently fail - don't block requests due to usage tracking
    return NextResponse.json({ success: true })
  }
}

// GET /api/usage/summary - Get usage summary for current user
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

    // Query usage data (table may not exist during launch)
    const { data, error } = await supabase
      .from('api_usage')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .limit(1000)

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist yet
      return NextResponse.json({
        totalCost: 0,
        totalRequests: 0,
        costByModel: {},
      })
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // aggregate stats
    let totalCost = 0
    const costByModel: Record<string, number> = {}

    (data || []).forEach((record: any) => {
      totalCost += record.cost_usd || 0
      costByModel[record.model] = (costByModel[record.model] || 0) + record.cost_usd
    })

    return NextResponse.json({
      totalCost: parseFloat(totalCost.toFixed(4)),
      totalRequests: data?.length || 0,
      costByModel,
    })
  } catch (error) {
    return NextResponse.json({
      totalCost: 0,
      totalRequests: 0,
      costByModel: {},
    })
  }
}
