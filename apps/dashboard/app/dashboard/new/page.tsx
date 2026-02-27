// apps/dashboard/app/dashboard/new/page.tsx
import { createTrigger } from '../actions'
import Link from 'next/link'

export default function NewTriggerPage() {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Nouveau Trigger</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Associez un élément de votre site à une micro-démo vidéo.
          </p>
        </div>
        <Link 
          href="/dashboard"
          className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          ← Retour
        </Link>
      </div>

<form action={createTrigger} className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 shadow-lg shadow-black/20">        
<div className="space-y-6">
          
          {/* Champ : Sélecteur CSS */}
          <div>
            <label htmlFor="selector" className="block text-sm font-medium text-zinc-300 mb-2">
              Sélecteur CSS cible
            </label>
            <input
              type="text"
              name="selector"
              id="selector"
              required
              placeholder="ex: #btn-add-to-cart, .pricing-card"
              className="block w-full rounded-md border-0 py-2.5 px-3 bg-zinc-950 text-zinc-100 ring-1 ring-inset ring-zinc-800 placeholder:text-zinc-600 focus:ring-2 focus:ring-inset focus:ring-bordeaux-500 sm:text-sm sm:leading-6 transition-all"
            />
            <p className="mt-2 text-xs text-zinc-500">
              C'est l'élément html que l'utilisateur devra survoler pour déclencher la vidéo.
            </p>
          </div>

          {/* Champ : Fichier Vidéo */}
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-zinc-300 mb-2">
              Micro-Démo (Vidéo)
            </label>
            <input
              type="file"
              name="video"
              id="video"
              accept="video/mp4,video/webm"
              required
              className="block w-full text-sm text-zinc-400
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-zinc-800 file:text-zinc-300
                hover:file:bg-zinc-700
                file:cursor-pointer file:transition-colors"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Format vertical recommandé (9:16). Durée max: 15 secondes.
            </p>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center rounded-lg bg-bordeaux-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-bordeaux-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux-500 transition-colors"
          >
            Sauvegarder et Activer
          </button>
        </div>
      </form>
    </div>
  )
}