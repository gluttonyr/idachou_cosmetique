import supabase from '../utils/supabase';

export const venteService = {

  // 📥 GET ALL
  getAll: async () => {
    const { data, error } = await supabase
      .from("Vente")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // 📥 GET BY ID
  getById: async (id: number) => {
    const { data, error } = await supabase
      .from("Vente")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  // 📥 GET BY STATUS
  getByStatus: async (status: "EN_ATTENTE" | "ECHOUER" | "VALIDER") => {
    const { data, error } = await supabase
      .from("Vente")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // 📥 GET VENTE + SES PRODUITS
  getWithProduits: async (id: number) => {
    const { data, error } = await supabase
      .from("Vente")
      .select(`
        *,
        VenteProduit (
          *,
          Produit (*)
        )
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  // 📥 GET VENTE PRODUITS UNIQUEMENT
  getVenteProduits: async (venteId: number) => {
    const { data, error } = await supabase
      .from("VenteProduit")
      .select(`*, Produit (*)`)
      .eq("vente_id", venteId);
    if (error) throw error;
    return data;
  },

  // 📊 GET STATS DASHBOARD (nouvelle méthode)
  getDashboardStats: async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    // Total commandes
    const { count: totalVentes, error: e1 } = await supabase
      .from("Vente")
      .select("*", { count: "exact", head: true });

    // Revenus 7 derniers jours (uniquement VALIDER)
    const { data: weeklyData, error: e2 } = await supabase
      .from("Vente")
      .select("prixTotal")
      .eq("status", "VALIDER")
      .gte("created_at", weekAgoISO);

    // Commandes récentes (5 dernières)
    const { data: recentOrders, error: e3 } = await supabase
      .from("Vente")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (e1 || e2 || e3) throw e1 || e2 || e3;

    const weeklyRevenue = (weeklyData || []).reduce(
      (sum, v) => sum + (v.prixTotal || 0), 0
    );

    return {
      totalVentes: totalVentes || 0,
      weeklyRevenue,
      recentOrders: recentOrders || [],
    };
  },

  // 📊 GET PRODUITS RÉCENTS DU JOUR (nouvelle méthode)
  getTodayProducts: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("Produit")
      .select("*")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 📤 CREATE
  create: async (payload: {
    prixTotal: number;
    reference: string;
    image?: string;
    status?: "EN_ATTENTE" | "ECHOUER" | "VALIDER";
    clientNom: string;
    clientPhone: string;
    clientEmail?: string;
    operateur: string;
  }) => {
    const { data, error } = await supabase
      .from("Vente")
      .insert([{
        ...payload,
        status: payload.status || "EN_ATTENTE",
        // ✅ Supprimé date_creation — Supabase gère created_at automatiquement
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ✏️ UPDATE STATUS
  updateStatus: async (
    id: number,
    status: "EN_ATTENTE" | "ECHOUER" | "VALIDER"
  ) => {
    const { data, error } = await supabase
      .from("Vente")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ✏️ UPDATE GENERAL
  update: async (id: number, updates: Partial<{
    prixTotal: number;
    image: string;
    clientNom: string;
    clientPhone: string;
    clientEmail: string;
    operateur: string;
    status: "EN_ATTENTE" | "ECHOUER" | "VALIDER";
  }>) => {
    const { data, error } = await supabase
      .from("Vente")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ❌ DELETE
  delete: async (id: number) => {
    const { error } = await supabase
      .from("Vente")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },
};