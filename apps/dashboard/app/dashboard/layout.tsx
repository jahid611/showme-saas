import { LayoutGrid, Settings, PlusSquare, LogOut, Terminal, Play } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Uniquement les menus fonctionnels
  const navItems = [
    { icon: <LayoutGrid size={22} />, label: 'Studio', href: '/dashboard' },
    { icon: <PlusSquare size={22} />, label: 'Nouveau Projet', href: '/dashboard/new' },
    { icon: <Play size={22} />, label: 'Sandbox de Test', href: '/dashboard/test' }, // Intégration de la Sandbox
    { icon: <Terminal size={22} />, label: 'Installation', href: '/dashboard/install' },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden w-full font-sans">
      
      {/* SIDEBAR ULTRA-VISIBLE (260px) */}
      <aside className="w-[260px] border-r border-zinc-900 bg-[#020202] flex flex-col z-40">
        
        <div className="p-10">
          <Link href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-bordeaux-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-[0_0_30px_rgba(128,0,32,0.4)] group-hover:rotate-6 transition-all duration-500">
              S
            </div>
            <span className="text-2xl font-black tracking-tighter">ShowMe<span className="text-bordeaux-500">.</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <p className="px-4 text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-6">Menu Principal</p>
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex items-center gap-5 px-5 py-4 text-zinc-500 hover:text-white hover:bg-zinc-900/50 rounded-[22px] transition-all duration-300 group relative"
            >
              <span className="group-hover:text-bordeaux-500 transition-all duration-300">
                {item.icon}
              </span>
              <span className="text-[14px] font-bold tracking-tight">{item.label}</span>
              
              {/* Indicateur de sélection (Border Left Glow) */}
              <div className="absolute left-0 w-1 h-0 bg-bordeaux-500 rounded-r-full group-hover:h-6 transition-all duration-500 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 shadow-[0_0_15px_#800020]"></div>
            </Link>
          ))}
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-6 border-t border-zinc-900 mt-auto bg-black/20">
          <Link href="/dashboard/settings" className="flex items-center gap-4 px-5 py-3 text-zinc-600 hover:text-white transition-colors mb-2">
            <Settings size={18} />
            <span className="text-xs font-bold">Paramètres</span>
          </Link>
          <button className="flex items-center gap-4 px-5 py-3 text-zinc-600 hover:text-red-500 transition-all duration-300 w-full group font-bold">
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ZONE DE CONTENU DYNAMIQUE */}
      <main className="flex-1 flex overflow-hidden bg-black relative">
        {/* Grain de fond pour le look premium */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}