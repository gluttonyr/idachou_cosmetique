import supabase from '../utils/supabase';

// 🔥 SERVICE VENTE PRODUIT
export const venteProduitService = {
  
  // 📥 GET ALL
  getAll: async () => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .select("*")

    if (error) throw error
    return data
  },

  // 📥 GET BY ID
  getById: async (id: number) => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  // 📥 GET VENTE FROM VENTE PRODUIT
  getVenteByVenteProduitId: async (id: number) => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .select(`
        id,
        vente_id,
        Vente (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data?.Vente
  },

  // 📥 GET PRODUIT FROM VENTE PRODUIT
  getProduitByVenteProduitId: async (id: number) => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .select(`
        id,
        produit_id,
        Produit (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data?.Produit
  },

  // 📥 GET LIST BY VENTE (tous les produits d'une vente)
  getByVenteId: async (venteId: number) => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .select(`
        *,
        Produit (*)
      `)
      .eq("vente_id", venteId)

    if (error) throw error
    return data
  },

  // 📥 GET LIST BY PRODUIT (toutes les ventes d’un produit)
  getByProduitId: async (produitId: number) => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .select(`
        *,
        Vente (*)
      `)
      .eq("produit_id", produitId)

    if (error) throw error
    return data
  },

  // 📤 INSERT ONE
  create: async (payload: {
    produit_id: number
    vente_id: number
    quantite: number
    prixUnitaire: number
  }) => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 📤 INSERT MULTIPLE (très utile pour panier)
  createMany: async (items: {
    produit_id: number
    vente_id: number
    quantite: number
    prixUnitaire: number
  }[]) => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .insert(items)
      .select()

    if (error) throw error
    return data
  },

  // ✏️ UPDATE
  update: async (id: number, updates: Partial<{
    quantite: number
    prixUnitaire: number
  }>) => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ❌ DELETE
  delete: async (id: number) => {
    const { error } = await supabase
      .from("VenteProduit")
      .delete()
      .eq("id", id)

    if (error) throw error
    return true
  }
}