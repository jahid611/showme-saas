// apps/dashboard/app/dashboard/actions.ts
'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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

const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );
};

export async function logout() {
  redirect('/login');
}

export async function createTrigger(formData: FormData) {
  console.log("[Backend] Action createTrigger initiée.");
  
  try {
    const selector = formData.get('selector') as string;
    const video_url = formData.get('video_url') as string;
    const user_id = formData.get('user_id') as string;

    if (!user_id) {
      throw new Error("L'identifiant utilisateur est manquant dans le payload de la requête.");
    }

    const supabaseAdmin = getAdminClient();

    console.log(`[Backend] Tentative d'insertion SQL pour l'utilisateur ${user_id}...`);
    const { data, error } = await supabaseAdmin
      .from('video_triggers')
      .insert([{ 
        selector: selector, 
        video_url: video_url,
        user_id: user_id 
      }])
      .select();

    if (error) {
      console.error("[Backend] Échec de l'insertion SQL :", error);
      throw error;
    }

    console.log("[Backend] Insertion SQL réussie :", data);
    
    // CORRECTION : L'invalidation du cache se fait UNIQUEMENT après le succès
    revalidatePath('/dashboard');
    return { success: true };

  } catch (error) {
    console.error("[Backend] Exception fatale attrapée :", error);
    throw new Error(error instanceof Error ? error.message : "Erreur serveur inconnue");
  }
}

export async function deleteTrigger(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) throw new Error("ID du trigger manquant");

  const supabaseAdmin = getAdminClient();

  const { data: trigger } = await supabaseAdmin
    .from('video_triggers')
    .select('video_url')
    .eq('id', id)
    .single();

  if (trigger?.video_url) {
    const urlParts = trigger.video_url.split('/');
    const fileName = urlParts.pop();
    const folderName = urlParts.pop(); 
    
    if (fileName && folderName) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('videos')
        .remove([`${folderName}/${fileName}`]);
        
      if (storageError) console.error("[ShowMe] Erreur suppression fichier:", storageError);
    }
  }

  const { error: dbError } = await supabaseAdmin
    .from('video_triggers')
    .delete()
    .eq('id', id);

  if (dbError) throw new Error(`Erreur suppression BDD: ${dbError.message}`);

  revalidatePath('/dashboard');
}

export async function updateTrigger(formData: FormData) {
  const id = formData.get('id') as string;
  const selector = formData.get('selector') as string;
  const new_video_url = formData.get('video_url') as string | null; 
  
  const supabaseAdmin = getAdminClient();

  const { data: oldTrigger } = await supabaseAdmin
    .from('video_triggers')
    .select('video_url')
    .eq('id', id)
    .single();

  let finalVideoUrl = oldTrigger?.video_url;

  if (new_video_url && new_video_url !== finalVideoUrl) {
    if (oldTrigger?.video_url) {
      const oldPath = oldTrigger.video_url.split('/').slice(-2).join('/'); 
      await supabaseAdmin.storage.from('videos').remove([oldPath]);
    }
    
    finalVideoUrl = new_video_url;
  }

  const { error: updateError } = await supabaseAdmin
    .from('video_triggers')
    .update({
      selector,
      video_url: finalVideoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath('/dashboard');
  redirect('/dashboard');
}