// apps/dashboard/app/api/triggers/[clientId]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// On définit les headers une fois pour toutes
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> } // Type Promise obligatoire en Next 15
) {
  // ÉTAPE 1 : On attend la résolution de l'ID
  const { clientId } = await params;

  // ÉTAPE 2 : Initialisation Admin
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data, error } = await supabaseAdmin
      .from('video_triggers')
      .select('id, selector, video_url')
      .eq('user_id', clientId);

    if (error) throw error;

    return NextResponse.json(data, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error: any) {
    console.error("[API ERROR]:", error);
    // On renvoie l'erreur AVEC les headers CORS pour ne pas bloquer le navigateur
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}