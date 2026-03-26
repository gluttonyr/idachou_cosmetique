// service/operateurService.ts
import supabase from '../utils/supabase';

export const operateurService = {
  /**
   * Récupère tous les opérateurs
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('Operateur')
      .select('*')
      .order('created_at', { ascending: false }); // optionnel : trie par date de création

    if (error) throw error;
    return data;
  },
};