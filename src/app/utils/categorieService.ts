// Dans un fichier categorieService.ts (ou à ajouter dans productService.ts)
import supabase from "../utils/supabase"

export const categorieService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from("Categorie")
      .select("*")
      .order("libelle", { ascending: true })
    if (error) throw error
    return data as { id: number; libelle: string; description: string }[]
  },
}