// apps/dashboard/app/dashboard/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '../../utils/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function createTrigger(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const selector = formData.get('selector') as string
  const videoFile = formData.get('video') as File

  if (!selector || !videoFile || videoFile.size === 0) {
    throw new Error("Le sélecteur et la vidéo sont obligatoires")
  }

  // 1. Génération d'un nom de fichier unique et sécurisé (Pathing)
  const fileExt = videoFile.name.split('.').pop()
  const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`

  // 2. Upload direct vers Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(fileName, videoFile, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) throw new Error(`Erreur d'upload: ${uploadError.message}`)

  // 3. Récupération de l'URL publique (CDN)
  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName)

  // 4. Enregistrement en base de données
  const { error: dbError } = await supabase
    .from('video_triggers')
    .insert({
      user_id: user.id,
      selector: selector,
      video_url: publicUrl,
    })

  if (dbError) throw new Error(`Erreur BDD: ${dbError.message}`)

  // 5. Purge du cache et redirection
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// Ajoute ceci à la fin de apps/dashboard/app/dashboard/actions.ts

export async function deleteTrigger(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const id = formData.get('id') as string
  if (!id) throw new Error("ID du trigger manquant")

  // 1. Récupération de l'URL pour isoler le fichier physique
  const { data: trigger } = await supabase
    .from('video_triggers')
    .select('video_url')
    .eq('id', id)
    .single()

  // 2. Suppression du fichier dans Supabase Storage (Le nettoyage CDN)
  if (trigger?.video_url) {
    const urlParts = trigger.video_url.split('/')
    const fileName = urlParts.pop() // Ex: e5387062-...mp4
    const folderName = urlParts.pop() // Ex: 32aa9a3d-... (user.id)
    
    if (fileName && folderName) {
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([`${folderName}/${fileName}`])
        
      if (storageError) console.error("[ShowMe] Erreur suppression fichier:", storageError)
    }
  }

  // 3. Suppression de la ligne en Base de Données
  const { error: dbError } = await supabase
    .from('video_triggers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Double sécurité RLS

  if (dbError) throw new Error(`Erreur suppression BDD: ${dbError.message}`)

  // 4. Rafraîchissement de l'interface
  revalidatePath('/dashboard')
}

// apps/dashboard/app/dashboard/actions.ts

export async function updateTrigger(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const id = formData.get('id') as string
  const selector = formData.get('selector') as string
  const videoFile = formData.get('video') as File | null
  
  // 1. Récupérer l'ancien trigger pour connaître l'URL actuelle
  const { data: oldTrigger } = await supabase
    .from('video_triggers')
    .select('video_url')
    .eq('id', id)
    .single()

  let finalVideoUrl = oldTrigger?.video_url

  // 2. Si une NOUVELLE vidéo est fournie (taille > 0)
  if (videoFile && videoFile.size > 0) {
    // A. Supprimer l'ancienne vidéo du Storage
    if (oldTrigger?.video_url) {
      const oldPath = oldTrigger.video_url.split('/').slice(-2).join('/') // user_id/file.mp4
      await supabase.storage.from('videos').remove([oldPath])
    }

    // B. Uploader la nouvelle
    const fileName = `${crypto.randomUUID()}.mp4`
    const filePath = `${user.id}/${fileName}`
    
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, videoFile)

    if (uploadError) throw new Error("Échec upload nouvelle vidéo")

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath)
      
    finalVideoUrl = publicUrl
  }

  // 3. Mise à jour de la base de données
  const { error: updateError } = await supabase
    .from('video_triggers')
    .update({
      selector,
      video_url: finalVideoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) throw new Error(updateError.message)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}