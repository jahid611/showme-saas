"use client";

// apps/dashboard/app/dashboard/new/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createTrigger, getSecureUserId } from '../actions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewTriggerPage() {
  const router = useRouter(); 
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('video') as File;
    const selector = formData.get('selector') as string;

    if (!file || file.size === 0) {
      alert("Veuillez sélectionner une vidéo.");
      setIsUploading(false);
      return;
    }

    try {
      const userId = await getSecureUserId();
      
      if (!userId) {
        throw new Error("Session invalide. Reconnectez-vous.");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `triggers/${userId}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('videos') 
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const actionFormData = new FormData();
      actionFormData.append('selector', selector);
      actionFormData.append('video_url', publicUrl);
      actionFormData.append('user_id', userId); 
      
      await createTrigger(actionFormData);
      
      // CORRECTION : Déverrouillage UI immédiat et push sans refresh conflictuel
      setIsUploading(false);
      router.push('/dashboard'); 

    } catch (error) {
      console.error("❌ Erreur :", error);
      alert(error instanceof Error ? error.message : "L'opération a échoué.");
      setIsUploading(false); 
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 50 * 1024 * 1024) { 
      alert("⚠️ La vidéo est trop lourde ! La limite est fixée à 50 Mo.");
      e.target.value = ""; 
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Nouveau Trigger</h2>
        </div>
        <Link href="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
          ← Retour
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 shadow-lg shadow-black/20">        
        <div className="space-y-6">
          <div>
            <label htmlFor="selector" className="block text-sm font-medium text-zinc-300 mb-2">Sélecteur CSS</label>
            <input type="text" name="selector" id="selector" required className="block w-full rounded-md border-0 py-2.5 px-3 bg-zinc-950 text-zinc-100 ring-1 ring-inset ring-zinc-800 focus:ring-2 focus:ring-bordeaux-500 transition-all" />
          </div>

          <div>
            <label htmlFor="video" className="block text-sm font-medium text-zinc-300 mb-2">Vidéo</label>
            <input type="file" name="video" id="video" accept="video/mp4,video/webm" required onChange={handleFileChange} disabled={isUploading} className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700" />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
          <button type="submit" disabled={isUploading} className="inline-flex justify-center rounded-lg bg-bordeaux-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-bordeaux-600 focus-visible:outline focus-visible:outline-2 disabled:opacity-50 transition-colors">
            {isUploading ? 'Upload en cours...' : 'Sauvegarder et Activer'}
          </button>
        </div>
      </form>
    </div>
  )
}