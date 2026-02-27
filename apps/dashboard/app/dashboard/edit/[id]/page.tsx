// apps/dashboard/app/dashboard/edit/[id]/page.tsx
import { createClient } from '../../../../utils/supabase/server'
import { updateTrigger } from '../../actions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Dans Next.js 15, params est une Promise
export default async function EditTriggerPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // ÉTAPE CRUCIALE : On attend la résolution des paramètres de l'URL
  const { id } = await params
  
  const supabase = await createClient()
  
  const { data: trigger } = await supabase
    .from('video_triggers')
    .select('*')
    .eq('id', id)
    .single()

  // Si l'ID n'existe pas en BDD, on renvoie vers la page 404
  if (!trigger) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2">
          ← Retour au dashboard
        </Link>
        <h1 className="text-3xl font-bold text-zinc-100 mt-4">Modifier le Trigger</h1>
      </div>

      <form action={updateTrigger} className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 shadow-lg">
        {/* On passe l'ID caché pour l'Action Serveur */}
        <input type="hidden" name="id" value={trigger.id} />
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Sélecteur CSS</label>
            <input 
              name="selector"
              defaultValue={trigger.selector}
              required
              placeholder="#mon-bouton"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-bordeaux-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Vidéo actuelle (Optionnel : upload pour remplacer)
            </label>
            <div className="mb-4 aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-black">
              <video src={trigger.video_url} controls className="w-full h-full object-contain" />
            </div>
            <input 
              type="file" 
              name="video" 
              accept="video/mp4"
              className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bordeaux-500/10 file:text-bordeaux-400 hover:file:bg-bordeaux-500/20"
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full bg-bordeaux-500 hover:bg-bordeaux-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}