'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TestPage() {
  const [triggers, setTriggers] = useState<any[]>([]);
  const [activeTrigger, setActiveTrigger] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchTriggers = async () => {
      const { data, error } = await supabase
        .from('video_triggers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error("Erreur Supabase:", error.message);
      else if (data) {
        setTriggers(data);
        if (data.length > 0) setActiveTrigger(data[0]);
      }
      setLoading(false);
    };
    fetchTriggers();
  }, []);

  if (loading) return <div className="flex w-full h-full min-h-screen bg-[#050505] text-white items-center justify-center">Chargement...</div>;

  return (
    <div className="flex w-screen h-screen bg-[#050505] text-white overflow-hidden font-sans">
      
      {/* SIDEBAR GAUCHE */}
      <div className="w-80 border-r border-gray-800/80 bg-[#0a0a0a] flex flex-col h-full z-50 shrink-0">
        <div className="p-6 border-b border-gray-800/50">
          <h2 className="text-xl font-bold tracking-wide">Mes Triggers</h2>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {triggers.map((trigger) => (
            <div
              key={trigger.id}
              onClick={() => setActiveTrigger(trigger)}
              className={`p-5 border-b border-gray-800/50 cursor-pointer transition-all ${
                activeTrigger?.id === trigger.id ? 'bg-gray-800/80 border-l-4 border-l-white' : 'hover:bg-gray-900/50 border-l-4 border-l-transparent'
              }`}
            >
              <div className="font-semibold text-gray-200 truncate">{trigger.title || 'Trigger'}</div>
              <div className="text-xs text-gray-500 font-mono mt-1">{trigger.selector}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ZONE DROITE : SITE DE TEST */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        
        {/* BACKGROUND OPTIMISÉ POUR FORTE COMPRESSION */}
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{
            backgroundImage: 'url(/newyork.jpg)', 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.5) contrast(1.2) saturate(1.2) blur(1px)', // Cache les artefacts de compression
          }}
        />
        
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/80 to-black" />

        {/* CONTENEUR DU BOUTON ET DU TRIGGER (CÔTE À CÔTE) */}
        <div className="relative z-20 flex items-center justify-center w-full h-full max-w-6xl px-12">
          
          {/* BLOC BOUTON */}
          <div className="flex flex-col items-center lg:items-start gap-6 transition-all duration-500">
            <h1 className="text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">
              TESTEZ <span className="text-gray-500">VOS</span><br />
              <span className="text-white">CRÉATIONS</span>
            </h1>

            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="mt-6 px-10 py-5 bg-white text-black rounded-full font-black tracking-widest text-sm uppercase hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] z-30"
            >
              {activeTrigger ? `SURVOLER ${activeTrigger.selector}` : 'CHOISIR UN TRIGGER'}
            </button>
          </div>

          {/* MOCKUP iPHONE 17 (Positionné à côté du bouton) */}
          <div 
            className={`ml-20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
              activeTrigger && isHovered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-90 pointer-events-none'
            }`}
          >
            {activeTrigger && (
              <div 
                className="relative w-[320px] h-[660px] rounded-[3rem] border-[6px] bg-black shadow-[0_0_80px_rgba(0,0,0,0.8)]"
                style={{ borderColor: activeTrigger.device_color || '#800020' }}
              >
                {/* BOUTONS PHYSIQUES iPHONE 17 */}
                <div className="absolute -left-[9px] top-32 w-[3px] h-6 rounded-l-sm" style={{ backgroundColor: activeTrigger.device_color }} />
                <div className="absolute -left-[9px] top-44 w-[3px] h-12 rounded-l-sm" style={{ backgroundColor: activeTrigger.device_color }} />
                <div className="absolute -right-[9px] top-48 w-[3px] h-16 rounded-r-sm" style={{ backgroundColor: activeTrigger.device_color }} />

                {/* ÉCRAN + DYNAMIC ISLAND */}
                <div className="absolute inset-0 rounded-[2.6rem] overflow-hidden bg-black">
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-30 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-900/20 rounded-full mr-2" />
                  </div>
                  
                  <video 
                    src={activeTrigger.video_url} 
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}