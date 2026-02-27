// apps/dashboard/app/api/triggers/[clientId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Nous instancions un client admin dédié à cette route
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  // Extraction de l'ID depuis l'URL dynamique
  const { clientId } = await params

  if (!clientId) {
    return NextResponse.json({ error: 'Client ID manquant' }, { status: 400 })
  }

  // Requête en base de données : on ne prend que les triggers ACTIFS de ce client
  const { data: triggers, error } = await supabaseAdmin
    .from('video_triggers')
    .select('selector, video_url') // On ne renvoie que le strict nécessaire au widget
    .eq('user_id', clientId)
    .eq('is_active', true)

  if (error) {
    console.error("Erreur API Triggers:", error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  // Configuration stricte du cache (CORS) pour autoriser les sites clients à appeler cette API
  return NextResponse.json(triggers, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Autorise l'appel depuis n'importe quel site web
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', // Mise en cache Edge
    },
  })
}