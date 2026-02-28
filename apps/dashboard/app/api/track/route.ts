// apps/dashboard/app/api/track/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { triggerId, clientId, isSandbox } = await request.json();

    // 🛑 PROTECTION : Si c'est la Sandbox, on simule le succès sans écrire en BDD
    if (isSandbox === true) {
      return NextResponse.json({ success: true, sandbox: true }, { headers: corsHeaders });
    }

    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert({
        trigger_id: triggerId,
        user_id: clientId,
        event_type: 'view'
      });

    if (error) throw error;
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: "Failed to track" }, { status: 500, headers: corsHeaders });
  }
}