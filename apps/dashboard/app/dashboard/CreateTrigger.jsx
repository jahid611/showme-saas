import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Utilise 'next/router' si tu es sur l'ancien Pages Router
import { supabase } from '@/lib/supabase'; // Ajuste le chemin vers ton client Supabase

export default function CreateTrigger() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Nouveaux états incluant le title
  const [formData, setFormData] = useState({
    title: '',
    selector: '',
    device_color: '#800020',
    video_url: '',
    is_active: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // LOGIQUE 1 : Formatage automatique du sélecteur
    let finalSelector = formData.selector.trim();
    if (finalSelector && !finalSelector.startsWith('#') && !finalSelector.startsWith('.')) {
      finalSelector = `#${finalSelector}`;
    }

    // LOGIQUE 2 : Définition d'un titre par défaut si le champ est laissé vide
    const finalTitle = formData.title.trim() === '' ? finalSelector : formData.title;

    try {
      const { data, error } = await supabase
        .from('triggers')
        .insert([
          {
            title: finalTitle,
            selector: finalSelector,
            device_color: formData.device_color,
            video_url: formData.video_url,
            is_active: formData.is_active,
            // user_id: 'Ton-UUID-User-Ici' // N'oublie pas d'injecter l'ID de l'utilisateur connecté
          }
        ])
        .select();

      if (error) throw error;

      // LOGIQUE 3 : Redirection réelle vers le dashboard après le succès
      router.push('/dashboard');
      
    } catch (error) {
      console.error("Erreur lors de la création du trigger:", error.message);
      alert("Erreur de création : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Créer un nouveau Trigger</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* NOUVEAU CHAMP : TITRE */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Titre visuel</label>
          <input
            type="text"
            required
            placeholder="Ex: Bouton d'achat"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* CHAMP : SELECTOR */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sélecteur CSS</label>
          <input
            type="text"
            required
            placeholder="Ex: button-cart (le # sera ajouté automatiquement)"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={formData.selector}
            onChange={(e) => setFormData({ ...formData, selector: e.target.value })}
          />
        </div>

        {/* CHAMP : COULEUR */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur du châssis</label>
          <input
            type="color"
            className="mt-1 block w-full h-10 border border-gray-300 rounded-md p-1"
            value={formData.device_color}
            onChange={(e) => setFormData({ ...formData, device_color: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          {loading ? 'Création en cours...' : 'Créer le trigger'}
        </button>
      </form>
    </div>
  );
}