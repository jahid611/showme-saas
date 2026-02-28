"use client";

import { useState, useRef } from 'react';
import Link from 'next/link'; // FIX: Toujours next/link pour le composant JSX
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createTrigger, getSecureUserId } from '../actions';
import { 
  ChevronLeft, Upload, Monitor, Smartphone, 
  Palette, Sparkles, ArrowRight, Type, Square, Layout 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewTriggerPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selector, setSelector] = useState("");
  const [deviceColor, setDeviceColor] = useState("#2B3E52"); 
  const [isMobileStyle, setIsMobileStyle] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const iphoneThemes = [
    { name: 'Bleu Pacifique (12 Pro)', hex: '#2E4755' },
    { name: 'Mauve (12)', hex: '#B9B8D3' },
    { name: 'Vert Alpes (13 Pro)', hex: '#505E4C' },
    { name: 'Bleu Sierra (13 Pro)', hex: '#A7C1D9' },
    { name: 'Rose (13)', hex: '#FAE3E3' },
    { name: 'Violet Profond (14 Pro)', hex: '#4B4654' },
    { name: 'Lumière Stellaire (14)', hex: '#F2F3EE' },
    { name: 'Titane Naturel (15 Pro)', hex: '#BCB4AC' },
    { name: 'Bleu Titane (15 Pro)', hex: '#474E5A' },
    { name: 'Bleu Pastel (15)', hex: '#D1E2E9' },
    { name: 'Outremer (16)', hex: '#52668E' },
    { name: 'Titane Désert (16 Pro)', hex: '#C8B39B' },
    { name: 'Rose (16)', hex: '#E6B2B9' },
    { name: 'Orange Cosmique (17 Pro)', hex: '#E86D44' },
    { name: 'Bleu Intense (17 Pro)', hex: '#2B3E52' },
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
    setIsUploading(true);

    try {
      const userId = await getSecureUserId();
      if (!userId) throw new Error("No user");
      const file = fileInputRef.current?.files?.[0];
      if (!file) throw new Error("No file");

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `triggers/${userId}/${fileName}`;

      const { error: upError } = await supabase.storage.from('videos').upload(filePath, file);
      if (upError) throw upError;

      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);

      const cleanSelector = selector.trim().startsWith('#') || selector.trim().startsWith('.') 
        ? selector.trim() : `#${selector.trim()}`;

      const formData = new FormData();
      formData.append('title', title);
      formData.append('selector', cleanSelector);
      formData.append('video_url', publicUrl);
      formData.append('user_id', userId);
      formData.append('device_color', deviceColor);
      
      // IMPORTANT: Envoi en string pour le parsing backend
      formData.append('is_mobile_style', isMobileStyle ? 'true' : 'false');

      await createTrigger(formData);
      
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-1 h-full bg-[#020202] overflow-hidden font-sans">
      <header className="absolute top-0 left-0 right-0 h-20 border-b border-zinc-900/50 bg-black/40 backdrop-blur-xl flex items-center justify-between px-10 z-50">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500"><ChevronLeft size={20} /></Link>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Studio de Création</span>
        </div>
        <button 
          form="trigger-form" type="submit"
          disabled={isUploading || !previewUrl || !selector || !title}
          className="bg-white text-black px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 disabled:opacity-20 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          {isUploading ? "PUBLICATION..." : "PUBLIER LE TRIGGER"}
        </button>
      </header>

      <div className="flex flex-1 mt-20">
        <section className="w-[450px] border-r border-zinc-900/50 bg-[#050505] flex flex-col p-10 overflow-y-auto scrollbar-hide">
          <form id="trigger-form" onSubmit={handleSubmit} className="space-y-12 pb-10">
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-white uppercase text-[10px] font-black tracking-widest"><Type size={14} /> Titre</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-black border-2 border-zinc-900 rounded-2xl h-14 px-6 text-sm focus:border-white/20 outline-none transition-all text-zinc-300" />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-white uppercase text-[10px] font-black tracking-widest"><Monitor size={14} /> Sélecteur CSS</label>
              <input type="text" required placeholder="#mon-bouton" value={selector} onChange={(e) => setSelector(e.target.value)} className="w-full bg-black border-2 border-zinc-900 rounded-2xl h-14 px-6 text-sm focus:border-bordeaux-500 outline-none transition-all font-mono text-zinc-300" />
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 text-white uppercase text-[10px] font-black tracking-widest"><Layout size={14} /> Style d'Affichage</label>
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
              <label className="flex items-center gap-3 text-white uppercase text-[10px] font-black tracking-widest"><Palette size={14} /> Finition Châssis</label>
              <div className="grid grid-cols-5 gap-3">
                {iphoneThemes.map((t) => (
                  <button key={t.hex} type="button" onClick={() => setDeviceColor(t.hex)} className={`aspect-square rounded-xl border-2 transition-all ${deviceColor === t.hex ? 'border-white scale-110' : 'border-transparent opacity-40'}`} style={{ backgroundColor: t.hex }} />
                ))}
              </div>
            </div>

            <div onClick={() => fileInputRef.current?.click()} className={`group border-2 border-dashed rounded-[35px] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${previewUrl ? 'border-white/20 bg-white/5' : 'border-zinc-900 hover:border-zinc-700'}`}>
              <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
              <Upload className={previewUrl ? 'text-white' : 'text-zinc-700'} size={20} />
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{previewUrl ? "Changer Média" : "Importer Vidéo"}</p>
            </div>
          </form>
        </section>

        <section className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'url(/newyork.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3) blur(2px)' }} />
          <div className={`transition-all duration-700 relative w-[360px] aspect-[9/19.5] border-[10px] shadow-2xl overflow-hidden ${isMobileStyle ? 'rounded-[65px]' : 'rounded-3xl'}`} style={{ borderColor: deviceColor }}>
            {isMobileStyle && <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-30 border border-white/5" />}
            <div className="w-full h-full bg-[#050505] relative flex items-center justify-center">
              {previewUrl ? <video src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" /> : <div className="text-zinc-800 italic font-black text-[10px] uppercase">Preview</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}