// apps/dashboard/app/login/page.tsx
import { login } from './actions'
import { Zap, ChevronRight, Lock, Mail, Link } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-black w-full overflow-hidden">
      
      {/* CÔTÉ GAUCHE : BRANDING IMMERSIF (55% de la largeur) */}
      <section className="relative hidden lg:flex flex-1 flex-col justify-between p-16 border-r border-zinc-900 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-bordeaux-600/20 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-zinc-900/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-bordeaux-600 rounded-2xl flex items-center justify-center text-white font-black text-xl italic shadow-2xl shadow-bordeaux-600/40">S</div>
          <span className="text-3xl font-black tracking-tighter text-white">ShowMe.</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="text-7xl font-black text-white leading-[0.9] tracking-tighter mb-8 italic">
            Transformez <br/><span className="text-zinc-800">le survol</span> en <br/><span className="text-bordeaux-500 underline decoration-8 underline-offset-8">conversion.</span>
          </h1>
          <p className="text-zinc-500 text-lg font-medium leading-relaxed">
            L'outil d'explication vidéo le plus rapide pour les produits SaaS complexes.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
          <span>© 2026 ShowMe Inc</span>
          <span className="h-px w-12 bg-zinc-900"></span>
          <span>Privacy Policy</span>
        </div>
      </section>

      {/* CÔTÉ DROIT : FORMULAIRE (45% de la largeur) */}
      <section className="flex-[0.8] flex flex-col items-center justify-center p-8 bg-[#050505]">
        <div className="w-full max-w-sm space-y-12">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-white tracking-tight mb-3 italic">Connexion</h2>
            <p className="text-zinc-600 text-sm">Entrez vos accès pour rejoindre le studio.</p>
          </div>

          <form action={login} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-bordeaux-500 transition-colors" size={18} />
                <input 
                  name="email" 
                  type="email" 
                  placeholder="votre@email.com" 
                  required 
                  className="w-full bg-zinc-900 border border-zinc-800 h-16 pl-12 pr-6 rounded-2xl text-sm text-white focus:border-bordeaux-500 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-bordeaux-500 transition-colors" size={18} />
                <input 
                  name="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  className="w-full bg-zinc-900 border border-zinc-800 h-16 pl-12 pr-6 rounded-2xl text-sm text-white focus:border-bordeaux-500 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-white text-black h-16 rounded-2xl font-black text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5">
              ACCÉDER AU STUDIO <ChevronRight size={18} />
            </button>
          </form>

          <p className="text-center text-xs text-zinc-700 font-medium">
            Pas encore de compte ? <Link href="/signup" className="text-bordeaux-500 hover:text-white transition-colors font-bold">Contactez l'admin</Link>
          </p>
        </div>
      </section>
    </div>
  )
}