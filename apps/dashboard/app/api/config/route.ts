// apps/dashboard/app/api/config/route.ts
import { createClient } from '../../../utils/supabase/server'; 
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  if (!clientId) {
    return NextResponse.json({ error: "Missing Client ID" }, { status: 400 });
  }

  const supabase = await createClient();
  
  // Récupération des triggers réels du client
  const { data: triggers, error } = await supabase
    .from('video_triggers')
    .select('id, selector, video_url')
    .eq('user_id', clientId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Configuration CORS pour permettre l'accès depuis n'importe quel site web
  return NextResponse.json(triggers || [], {
    headers: {
      'Access-Control-Allow-Origin': '*', // Autorise tous les domaines
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Support pour les requêtes de pré-vérification (Preflight)
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}