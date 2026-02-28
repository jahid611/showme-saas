'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// --- HELPERS ---

/**
 * Récupère l'ID utilisateur de manière sécurisée côté serveur
 */
export async function getSecureUserId() {
  const cookieStore = await cookies(); 
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

/**
 * Initialise le client Supabase avec la Service Role Key 
 * (Pour contourner les RLS en écriture/suppression)
 */
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );
};

export async function logout() {
  // Optionnel : ajouter la logique de déconnexion Supabase ici si nécessaire
  redirect('/login');
}

// --- CORE ACTIONS ---

/**
 * Création d'un nouveau Trigger
 */
export async function createTrigger(formData: FormData) {
  const supabaseAdmin = getAdminClient();

  const title = formData.get('title') as string;
  const selector = formData.get('selector') as string;
  const video_url = formData.get('video_url') as string;
  const user_id = formData.get('user_id') as string;
  const device_color = formData.get('device_color') as string;
  
  // FIX CRITIQUE : Conversion du string "true"/"false" en boolean pur
  const is_mobile_style = formData.get('is_mobile_style') === 'true';

  if (!selector || !video_url || !user_id) {
    throw new Error("Données obligatoires manquantes");
  }

  const { error } = await supabaseAdmin
    .from('video_triggers')
    .insert({
      title: title || 'Sans titre',
      selector,
      video_url,
      user_id,
      device_color: device_color || '#2B3E52',
      is_mobile_style: is_mobile_style 
    });

if (error) {
  // Ceci s'affichera dans ton terminal de commande (VS Code)
  console.error("❌ ERREUR SUPABASE :", error.message); 
  console.error("Détails :", error.details);
  console.error("Code :", error.code);
  
  // Ceci s'affichera sur ton écran
  throw new Error(`Erreur BDD : ${error.message}`); 
}

  revalidatePath('/dashboard');
}

/**
 * Suppression d'un Trigger et de sa vidéo associée
 */
export async function deleteTrigger(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) throw new Error("ID du trigger manquant");

  const supabaseAdmin = getAdminClient();

  // 1. Récupération de l'URL pour nettoyer le Storage
  const { data: trigger } = await supabaseAdmin
    .from('video_triggers')
    .select('video_url')
    .eq('id', id)
    .single();

  if (trigger?.video_url) {
    // On extrait le chemin relatif du fichier dans le bucket
    const pathParts = trigger.video_url.split('/public/videos/');
    const storagePath = pathParts[1];

    if (storagePath) {
      await supabaseAdmin.storage.from('videos').remove([storagePath]);
    }
  }

  // 2. Suppression en base
  const { error: dbError } = await supabaseAdmin
    .from('video_triggers')
    .delete()
    .eq('id', id);

  if (dbError) throw new Error(`Erreur BDD: ${dbError.message}`);

  revalidatePath('/dashboard');
}

/**
 * Mise à jour d'un Trigger existant
 */
export async function updateTrigger(formData: FormData) {
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const selector = formData.get('selector') as string;
  const device_color = formData.get('device_color') as string;
  const is_mobile_style = formData.get('is_mobile_style') === 'true';
  const new_video_url = formData.get('video_url') as string | null; 
  
  const supabaseAdmin = getAdminClient();

  // 1. On récupère l'ancienne vidéo pour savoir s'il faut la supprimer
  const { data: oldTrigger } = await supabaseAdmin
    .from('video_triggers')
    .select('video_url')
    .eq('id', id)
    .single();

  let finalVideoUrl = oldTrigger?.video_url;

  // 2. Si une nouvelle vidéo est envoyée, on supprime l'ancienne
  if (new_video_url && new_video_url !== finalVideoUrl) {
    if (oldTrigger?.video_url) {
      const oldPathParts = oldTrigger.video_url.split('/public/videos/');
      const oldStoragePath = oldPathParts[1];
      if (oldStoragePath) {
        await supabaseAdmin.storage.from('videos').remove([oldStoragePath]);
      }
    }
    finalVideoUrl = new_video_url;
  }

  // 3. Update global
  const { error: updateError } = await supabaseAdmin
    .from('video_triggers')
    .update({
      title,
      selector,
      video_url: finalVideoUrl,
      device_color,
      is_mobile_style,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath('/dashboard');
  redirect('/dashboard');
}