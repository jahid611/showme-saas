// apps/dashboard/app/dashboard/page.tsx
import { createClient } from '../../utils/supabase/server'; // Chemin relatif direct
import { getSecureUserId } from './actions';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const userId = await getSecureUserId();
  
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-black">
        <p className="text-zinc-800 font-black uppercase tracking-[0.5em] animate-pulse italic">Session Expirée</p>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: triggers, error } = await supabase
    .from('video_triggers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) console.error("Supabase Error:", error);

  // On envoie un tableau vide [] si data est null pour garantir la stabilité
  return <DashboardClient initialTriggers={triggers || []} />;
}