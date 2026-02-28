"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit3, Trash2, Copy, Check, Eye, Activity, ChevronRight, Smartphone, Square 
} from 'lucide-react';
import { deleteTrigger } from './actions';
import { createClient } from '../../utils/supabase/client'; 

interface Trigger {
  id: string;
  title?: string;
  selector: string;
  video_url: string;
  user_id: string;
  device_color?: string;
  is_mobile_style?: boolean;
}

export default function DashboardClient({ initialTriggers = [] }: { initialTriggers: Trigger[] }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(
    initialTriggers.length > 0 ? (initialTriggers[0] ?? null) : null
  );
  
  const [copied, setCopied] = useState(false);
  const [views, setViews] = useState<number>(0);
  const [isPulsing, setIsPulsing] = useState(false);

  const scriptCode = `<script src="https://showme-saas.com/widget.js" data-client-id="${selectedTrigger?.user_id}" async></script>`;

  useEffect(() => {
    if (!selectedTrigger) return;

    const loadStats = async () => {
      const { count } = await supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('trigger_id', selectedTrigger.id);
      setViews(count || 0);
    };
    loadStats();

    const channel = supabase.channel(`stats-${selectedTrigger.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analytics_events', filter: `trigger_id=eq.${selectedTrigger.id}` }, () => {
      setViews(prev => prev + 1);
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTrigger, supabase]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-1 w-full h-full overflow-hidden bg-[#020202] text-zinc-400 font-sans">
      
      {/* LISTE */}
      <section className="w-[340px] border-r border-zinc-900/50 bg-black/20 flex flex-col shrink-0">
        <div className="p-8 pb-4 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Bibliothèque</h2>
          <button onClick={() => router.push('/dashboard/new')} className="p-2 bg-white text-black rounded-lg hover:scale-105 transition-all"><Plus size={16} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-2">
          {initialTriggers.map((t) => (
            <div 
              key={t.id} onClick={() => setSelectedTrigger(t)}
              className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer border transition-all ${selectedTrigger?.id === t.id ? 'bg-zinc-900/50 border-zinc-800 shadow-xl' : 'border-transparent hover:bg-zinc-900/30'}`}
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0" style={{ borderColor: t.device_color || '#2B3E52' }}>
                <video src={t.video_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" muted />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${selectedTrigger?.id === t.id ? 'text-white' : 'text-zinc-500'}`}>{t.title || t.selector}</p>
                <p className="text-[9px] font-mono text-zinc-600 truncate">{t.selector}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WORKSPACE */}
      <main className="flex-1 relative flex flex-col overflow-hidden bg-black">
        <header className="h-20 border-b border-zinc-900/50 flex items-center justify-between px-10 bg-black/40 backdrop-blur-md">
            <span className="text-sm font-bold text-white tracking-tight italic">{selectedTrigger?.title || 'Sélectionner un projet'}</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase">Live</span>
            </div>
        </header>

        <div className="flex-1 flex p-10 gap-12 overflow-y-auto items-center justify-center">
            {/* RENDU MIROIR DYNAMIQUE */}
            <div className="w-[360px] shrink-0">
                <div 
                  className={`relative aspect-[9/19.5] border-[10px] shadow-2xl transition-all duration-700 ${selectedTrigger?.is_mobile_style ? 'rounded-[60px]' : 'rounded-3xl'}`}
                  style={{ borderColor: selectedTrigger?.device_color || '#2B3E52' }}
                >
                    {selectedTrigger?.is_mobile_style && <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-30 border border-white/5" />}
                    <div className={`w-full h-full overflow-hidden bg-black relative ${selectedTrigger?.is_mobile_style ? 'rounded-[50px]' : 'rounded-2xl'}`}>
                        {selectedTrigger && <video key={selectedTrigger.video_url} src={selectedTrigger.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />}
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      {selectedTrigger?.is_mobile_style ? <><Smartphone size={14}/> iPhone 17 Pro</> : <><Square size={14}/> Rectangle Style</>}
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedTrigger?.device_color }} />
                </div>
            </div>

            {/* STATS & ACTIONS */}
            <div className="flex-1 max-w-lg space-y-8">
                <div className="p-10 rounded-[40px] border border-zinc-900/50 bg-zinc-900/5 transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Impressions Réelles</span>
                    <div className={`text-8xl font-black text-white tracking-tighter mt-2 tabular-nums transition-transform ${isPulsing ? 'scale-105' : 'scale-100'}`}>
                        {views}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                      <span>Widget Script</span>
                      <button onClick={copyToClipboard} className="text-white hover:text-bordeaux-500 transition-colors flex items-center gap-2 uppercase">
                        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 font-mono text-[11px] text-zinc-500 break-all leading-relaxed shadow-inner">
                      {scriptCode}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => router.push(`/dashboard/edit/${selectedTrigger?.id}`)} className="flex-1 h-14 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3">
                        <Edit3 size={16} /> Configurer
                    </button>
                    <form action={deleteTrigger} className="flex-1">
                        <input type="hidden" name="id" value={selectedTrigger?.id} />
                        <button className="w-full h-14 bg-zinc-900 text-zinc-600 rounded-2xl font-black text-[11px] uppercase tracking-widest border border-zinc-800 hover:text-red-500 transition-all flex items-center justify-center gap-3">
                            <Trash2 size={16} /> Supprimer
                        </button>
                    </form>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}