/**
 * Service de gestion des produits
 */

import supabase from "../utils/supabase"

const BUCKET = "products"

export const productService = {

  // 🔼 Upload image
  uploadImage: async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file)

    if (error) throw error

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName)

    return data.publicUrl
  },

  // 📥 GET ALL
  getAll: async () => {
    const { data, error } = await supabase
      .from("Produit")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // 📥 GET BY ID
  getById: async (id: number) => {
    const { data, error } = await supabase
      .from("Produit")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  // ➕ CREATE
  create: async (product: any) => {
    // upload images
    const profileUrl = product.profile
      ? await productService.uploadImage(product.profile)
      : null

    const image1Url = product.image1
      ? await productService.uploadImage(product.image1)
      : null

    const image2Url = product.image2
      ? await productService.uploadImage(product.image2)
      : null

    const image3Url = product.image3
      ? await productService.uploadImage(product.image3)
      : null


    const { data, error } = await supabase
      .from("Produit")
      .insert([
        {
          libelle: product.libelle,
          description: product.description,
          profile: profileUrl,
          image1: image1Url,
          image2: image2Url,
          image3: image3Url,
          prix: product.prix,
          stock: product.stock,
          categorie_id: product.categorie_id
        }
      ])
      .select()

    if (error) throw error
    return data
  },

  // ✏️ UPDATE
  update: async (id: number, product: any) => {

    let updateData: any = {
      libelle: product.libelle,
      description: product.description,
      prix: product.prix,
      stock: product.stock,
      categorie_id: product.categorie_id
    }

    // upload nouvelles images si présentes
    if (product.profile instanceof File) {
      updateData.profile = await productService.uploadImage(product.profile)
    }

    if (product.image1 instanceof File) {
      updateData.image1 = await productService.uploadImage(product.image1)
    }

    if (product.image2 instanceof File) {
      updateData.image2 = await productService.uploadImage(product.image2)
    }

    if (product.image3 instanceof File) {
      updateData.image3 = await productService.uploadImage(product.image3)
    }

    const { data, error } = await supabase
      .from("Produit")
      .update(updateData)
      .eq("id", id)
      .select()

    if (error) throw error
    return data
  },

  // 🔄 TOGGLE STATUT
toggleStatus: async (id: number, currentStatus: string) => {
  const newStatus = currentStatus === 'PUBLIER' ? 'EN_ATTENTE' : 'PUBLIER'
  const { data, error } = await supabase
    .from("Produit")
    .update({ statut: newStatus })
    .eq("id", id)
    .select()
  if (error) throw error
  return data
},
// 📥 GET BY CATEGORY LIBELLE
getByCategoryLabel: async (categorieLibelle: string, limit?: number) => {
  let query = supabase
    .from("Produit")
    .select(`
      *,
      Categorie!inner(libelle)   -- jointure interne avec la table Categorie
    `)
    .eq("Categorie.libelle", categorieLibelle)  // filtrer par libelle
    .eq("statut", "PUBLIER")
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
},

  // ❌ DELETE
  delete: async (id: number) => {
    const { error } = await supabase
      .from("Produit")
      .delete()
      .eq("id", id)

    if (error) throw error
  },

  // 🖼️ GET IMAGE URL (utile si tu veux standardiser)
  getImageUrl: (path: string) => {
    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path)

    return data.publicUrl
  }

}