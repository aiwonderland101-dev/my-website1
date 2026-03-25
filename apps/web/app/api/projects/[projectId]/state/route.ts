import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key);
};

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service unavailable - Supabase not configured' },
        { status: 503 }
      );
    }
    
    const { projectId } = params;
    const { state } = await request.json();

    // Get auth user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, ownerId')
      .eq('id', projectId)
      .eq('ownerId', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project state
    const { data: updated, error: updateError } = await supabase
      .from('projects')
      .update({
        state,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error saving project state:', error);
    return NextResponse.json(
      { error: 'Failed to save project state' },
      { status: 500 }
    );
  }
}
