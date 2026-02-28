// apps/dashboard/app/api/stats/[triggerId]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ triggerId: string }> }
) {
  const { triggerId } = await params;
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('trigger_id', triggerId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count: count || 0 }, {
    headers: { 'Cache-Control': 'no-store' } // Force la donnée fraîche
  });
}