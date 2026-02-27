// apps/dashboard/app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '../../utils/supabase/server'
import { logout } from './actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar Latérale */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Show<span className="text-bordeaux-500">Me</span>
            </h1>
            <p className="text-zinc-500 text-xs mt-1 font-mono uppercase tracking-wider">Studio Manager</p>
          </div>
          
          <nav className="px-4 mt-6 space-y-2">
            <a href="/dashboard" className="block px-4 py-2.5 bg-bordeaux-500 text-white rounded-md text-sm font-medium shadow-sm shadow-bordeaux-500/20">
              Mes Triggers
            </a>
            <a href="#" className="block px-4 py-2.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-md text-sm font-medium transition-colors">
              Paramètres
            </a>
            <a href="#" className="block px-4 py-2.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-md text-sm font-medium transition-colors">
              Documentation
            </a>
          </nav>
        </div>

        {/* Profil Utilisateur & Déconnexion */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
          <div className="text-xs text-zinc-500 mb-3 truncate px-2">
            Connecté en tant que :<br/>
            <strong className="text-zinc-300">{user.email}</strong>
          </div>
          <form action={logout}>
            <button type="submit" className="w-full text-left px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-md transition-colors font-medium">
              Déconnexion
            </button>
          </form>
        </div>
      </aside>
      
      {/* Contenu Principal Dynamique */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}