"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { updateTrigger, getSecureUserId } from '../../actions';
import { 
  ChevronLeft, Upload, Monitor, Smartphone, 
  Palette, Save, Type, Square, Layout, Sparkles 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditTriggerForm({ trigger }: { trigger: any }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(trigger.video_url);
  const [title, setTitle] = useState(trigger.title || "");
  const [selector, setSelector] = useState(trigger.selector || "");
  const [deviceColor, setDeviceColor] = useState(trigger.device_color || "#2B3E52");
  const [isMobileStyle, setIsMobileStyle] = useState(trigger.is_mobile_style ?? true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const iphoneThemes = [
    { name: 'Bleu Pacifique', hex: '#2E4755' }, { name: 'Mauve', hex: '#B9B8D3' },
    { name: 'Vert Alpes', hex: '#505E4C' }, { name: 'Bleu Sierra', hex: '#A7C1D9' },
    { name: 'Rose', hex: '#FAE3E3' }, { name: 'Violet Profond', hex: '#4B4654' },
    { name: 'Lumière Stellaire', hex: '#F2F3EE' }, { name: 'Titane Naturel', hex: '#BCB4AC' },
    { name: 'Bleu Titane', hex: '#474E5A' }, { name: 'Bleu Pastel', hex: '#D1E2E9' },
    { name: 'Outremer', hex: '#52668E' }, { name: 'Titane Désert', hex: '#C8B39B' },
    { name: 'Rose (16)', hex: '#E6B2B9' }, { name: 'Orange Cosmique', hex: '#E86D44' },
    { name: 'Bleu Intense', hex: '#2B3E52' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) return alert("Max 50 Mo");
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const userId = await getSecureUserId();
      let finalVideoUrl = trigger.video_url;

      // Si un nouveau fichier est sélectionné
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `triggers/${userId}/${fileName}`;
        const { error: upError } = await supabase.storage.from('videos').upload(filePath, file);
        if (upError) throw upError;
        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);
        finalVideoUrl = publicUrl;
      }

      const cleanSelector = selector.trim().startsWith('#') || selector.trim().startsWith('.') 
        ? selector.trim() : `#${selector.trim()}`;

      const formData = new FormData();
      formData.append('id', trigger.id);
      formData.append('title', title);
      formData.append('selector', cleanSelector);
      formData.append('video_url', finalVideoUrl);
      formData.append('device_color', deviceColor);
      formData.append('is_mobile_style', isMobileStyle ? 'true' : 'false');

      await updateTrigger(formData);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-1 h-full bg-[#020202] overflow-hidden font-sans w-full">
      
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 h-20 border-b border-zinc-900/50 bg-black/40 backdrop-blur-xl flex items-center justify-between px-10 z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500"><ChevronLeft size={20} /></Link>
          <div className="h-6 w-px bg-zinc-900"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Édition du Trigger</span>
        </div>
        
        <button 
          form="edit-form" type="submit"
          disabled={isUpdating}
          className="bg-white text-black px-10 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 disabled:opacity-20 transition-all flex items-center gap-3"
        >
          {isUpdating ? "Mise à jour..." : <>Sauvegarder <Save size={16} /></>}
        </button>
      </header>

      <div className="flex flex-1 mt-20">
        {/* CONFIGURATION */}
        <section className="w-[450px] border-r border-zinc-900/50 bg-[#050505] flex flex-col p-10 overflow-y-auto scrollbar-hide shrink-0">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-12 pb-10">
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-white uppercase text-[10px] font-black tracking-widest"><Type size={14} className="text-zinc-500" /> Titre du projet</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black border-2 border-zinc-900 rounded-2xl h-14 px-6 text-sm focus:border-white/20 outline-none transition-all text-zinc-300" />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-white uppercase text-[10px] font-black tracking-widest"><Monitor size={14} className="text-zinc-500" /> Sélecteur CSS</label>
              <input type="text" required value={selector} onChange={(e) => setSelector(e.target.value)} className="w-full bg-black border-2 border-zinc-900 rounded-2xl h-14 px-6 text-sm focus:border-bordeaux-500 outline-none transition-all font-mono text-zinc-300" />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-white uppercase text-[10px] font-black tracking-widest"><Layout size={14} className="text-zinc-500" /> Style de l'appareil</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setIsMobileStyle(true)} className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${isMobileStyle ? 'border-white bg-white/5' : 'border-zinc-900 bg-black opacity-40'}`}>
                  <Smartphone size={20} /><span className="text-[9px] font-bold uppercase tracking-widest">iPhone 17 Pro</span>
                </button>
                <button type="button" onClick={() => setIsMobileStyle(false)} className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${!isMobileStyle ? 'border-white bg-white/5' : 'border-zinc-900 bg-black opacity-40'}`}>
                  <Square size={20} /><span className="text-[9px] font-bold uppercase tracking-widest">Rectangle</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-white uppercase text-[10px] font-black tracking-widest"><Palette size={14} className="text-zinc-500" /> Finition Châssis</label>
              <div className="grid grid-cols-5 gap-3">
                {iphoneThemes.map((t) => (
                  <button key={t.hex} type="button" onClick={() => setDeviceColor(t.hex)} className={`aspect-square rounded-xl border-2 transition-all ${deviceColor === t.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`} style={{ backgroundColor: t.hex }} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-white uppercase text-[10px] font-black tracking-widest"><Upload size={14} className="text-zinc-500" /> Changer le média</label>
              <div onClick={() => fileInputRef.current?.click()} className="group border-2 border-dashed border-zinc-900 rounded-[35px] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-zinc-700 transition-all bg-black">
                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
                <Upload size={20} className="text-zinc-700 group-hover:text-white transition-colors" />
                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest text-center leading-relaxed">Remplacer le fichier actuel</span>
              </div>
            </div>

          </form>
        </section>

        {/* PREVIEW LIVE (GRANDE) */}
        <section className="flex-1 bg-black relative flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'url(/newyork.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3) blur(2px)' }} />
          
          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">
               <Sparkles size={14} /> Prévisualisation en direct
            </div>

            <div 
              className={`transition-all duration-700 relative w-[380px] aspect-[9/19.5] border-[10px] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden ${isMobileStyle ? 'rounded-[65px]' : 'rounded-3xl'}`}
              style={{ borderColor: deviceColor }}
            >
              {isMobileStyle && <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-30 border border-white/5" />}
              <div className="w-full h-full bg-[#050505] relative flex items-center justify-center">
                 {previewUrl && <video key={previewUrl} src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />}
              </div>
              <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
            </div>
            
            <div className="text-center">
               <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-2">{title || "Sans Titre"}</p>
               <p className="text-xl font-mono text-zinc-600 tracking-tighter" style={{ color: deviceColor }}>{selector}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}