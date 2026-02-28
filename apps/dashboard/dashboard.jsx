import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [triggers, setTriggers] = useState([]);
  const [activeTrigger, setActiveTrigger] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement initial des données
  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    const { data, error } = await supabase
      .from('triggers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erreur de récupération:", error);
    } else {
      setTriggers(data);
      if (data.length > 0) {
        setActiveTrigger(data[0]); // Sélectionne le premier par défaut
      }
    }
    setLoading(false);
  };

  const handleDelete = async (idToDelete) => {
    // 1. Trouver l'index de l'élément à supprimer
    const indexToDelete = triggers.findIndex((t) => t.id === idToDelete);
    
    // 2. Supprimer en base de données
    const { error } = await supabase.from('triggers').delete().eq('id', idToDelete);
    
    if (error) {
      console.error("Erreur lors de la suppression:", error);
      return;
    }

    // 3. Mettre à jour la liste locale
    const newTriggers = triggers.filter((t) => t.id !== idToDelete);
    setTriggers(newTriggers);

    // 4. LOGIQUE DE FOCUS : Passer sur la vue de celui d'à côté
    if (newTriggers.length === 0) {
      setActiveTrigger(null);
    } else {
      // Si l'élément supprimé n'était pas le dernier, on prend l'élément qui a pris sa place à cet index.
      // Si c'était le dernier, on prend l'élément précédent.
      const nextActiveIndex = indexToDelete < newTriggers.length ? indexToDelete : indexToDelete - 1;
      setActiveTrigger(newTriggers[nextActiveIndex]);
    }
  };

  if (loading) return <div>Chargement du dashboard...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* SIDEBAR : Liste des Triggers */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-4 font-bold border-b">Mes Triggers</div>
        {triggers.map((trigger) => (
          <div 
            key={trigger.id}
            onClick={() => setActiveTrigger(trigger)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 flex justify-between items-center ${
              activeTrigger?.id === trigger.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div>
              {/* UTILISATION DU NOUVEAU CHAMP TITRE */}
              <div className="font-semibold text-gray-800">{trigger.title}</div>
              <div className="text-xs text-gray-500 font-mono">{trigger.selector}</div>
            </div>
            
            {/* AFFICHAGE DE LA COULEUR DANS LA LISTE */}
            <div 
              className="w-6 h-6 rounded-full border border-gray-300 shadow-sm"
              style={{ backgroundColor: trigger.device_color }}
              title={trigger.device_color}
            />
          </div>
        ))}
      </div>

      {/* ZONE PRINCIPALE : Détail du Trigger actif */}
      <div className="w-2/3 p-8 flex flex-col items-center justify-center">
        {activeTrigger ? (
          <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg relative">
            
            <button 
              onClick={() => handleDelete(activeTrigger.id)}
              className="absolute top-4 right-4 bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200 transition text-sm font-semibold"
            >
              Supprimer ce trigger
            </button>

            <h2 className="text-2xl font-bold mb-6">{activeTrigger.title}</h2>
            
            {/* INJECTION DE LA COULEUR SUR LE COMPOSANT VISUEL (ex: Sandbox / Device frame) */}
            <div 
              className="w-full aspect-video rounded-3xl border-8 flex items-center justify-center shadow-inner overflow-hidden relative"
              style={{ borderColor: activeTrigger.device_color }}
            >
              <div className="absolute top-2 left-4 text-xs font-mono bg-black/50 text-white px-2 py-1 rounded">
                Sélecteur ciblé : {activeTrigger.selector}
              </div>
              
              <video 
                src={activeTrigger.video_url} 
                controls 
                className="w-full h-full object-cover bg-gray-900"
              />
            </div>
            
            <div className="mt-6 flex gap-4 text-sm text-gray-600">
              <p>Couleur active : <span className="font-mono bg-gray-100 px-2 py-1 rounded">{activeTrigger.device_color}</span></p>
              <p>Statut : {activeTrigger.is_active ? '✅ Actif' : '❌ Inactif'}</p>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-xl">Aucun trigger sélectionné.</div>
        )}
      </div>
    </div>
  );
}