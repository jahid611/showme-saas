// apps/dashboard/app/dashboard/page.tsx
import { createClient } from '../../utils/supabase/server'
import Link from 'next/link'
import { deleteTrigger } from './actions'
import CopyButton from '../../components/CopyButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Récupération de l'utilisateur et de ses données
  const { data: { user } } = await supabase.auth.getUser()
  const { data: triggers } = await supabase
    .from('video_triggers')
    .select('*')
    .order('created_at', { ascending: false })

  const hasTriggers = triggers && triggers.length > 0;

  // Génération du snippet avec le vrai ID du client
  const integrationCode = `<script src="https://ton-domaine.com/showme.js" data-client-id="${user?.id}"></script>`

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Mes Triggers Vidéo</h2>
          <p className="mt-2 text-base text-zinc-400">
            Gérez les vidéos contextuelles injectées sur votre site web via ShowMe.js
          </p>
        </div>
        {hasTriggers && (
          <Link 
            href="/dashboard/new"
            className="inline-flex items-center rounded-lg bg-bordeaux-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-bordeaux-600 transition-colors"
          >
            + Nouveau Trigger
          </Link>
        )}
      </header>

      {/* NOUVEAU : Encart d'intégration (Script) nettoyé */}
      <div className="mb-10 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-medium text-zinc-100 mb-2">Code d'intégration</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Copiez ce script et collez-le juste avant la balise <code className="text-bordeaux-400">&lt;/body&gt;</code> de votre site web.
        </p>
        <div className="flex items-center gap-3">
          <code className="flex-1 block bg-zinc-950 p-4 rounded-lg text-sm text-zinc-300 border border-zinc-800 font-mono overflow-x-auto">
            {integrationCode}
          </code>
          {/* Remplacement du bouton natif par le Client Component */}
          <CopyButton textToCopy={integrationCode} />
        </div>
      </div>

      {/* Grille de données / État Vide (Code existant) */}
      {!hasTriggers ? (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-16 text-center flex flex-col items-center justify-center shadow-lg shadow-black/20">
          <div className="h-20 w-20 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-bordeaux-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-zinc-100">Aucune vidéo configurée</h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-sm mb-8">
            Commencez par ajouter votre premier trigger CSS (ex: #bouton-achat) et associez-y une vidéo d'explication.
          </p>
          <Link 
            href="/dashboard/new"
            className="inline-flex items-center rounded-lg bg-bordeaux-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-bordeaux-600 transition-colors"
          >
            + Créer un nouveau Trigger
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {triggers.map((trigger) => (
            <div key={trigger.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-lg flex flex-col">
              <div className="aspect-[9/16] bg-black relative">
                <video 
                  src={trigger.video_url} 
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  autoPlay muted loop playsInline
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${trigger.is_active ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' : 'bg-zinc-400/10 text-zinc-400 ring-zinc-400/20'}`}>
                    {trigger.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-zinc-500 font-mono mb-1">Sélecteur CSS</p>
                  <code className="text-sm font-semibold text-zinc-200 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 break-all">
                    {trigger.selector}
                  </code>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end gap-3">
                  <Link 
  href={`/dashboard/edit/${trigger.id}`}
  className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
>
  Modifier
</Link>
                  
                  <form action={deleteTrigger}>
                    <input type="hidden" name="id" value={trigger.id} />
                    <button 
                      type="submit" 
                      className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}