/**
 * Service de gestion du chat (Discussion + Message)
 *
 * Hypothèses à vérifier / adapter dans ton projet :
 * - `sender_id` (table Message) et `user_id` (table Discussion) référencent auth.users.id
 * - Un utilisateur "admin" est identifié via app_metadata.role === "admin"
 * - La table Message possède une colonne `discussion_id` (bigint, FK vers Discussion.id).
 * - La table Discussion possède une colonne `username` (text).
 * - La fonction RPC `admin_discussions_with_unread` doit être créée en base
 *   (voir migration SQL fournie séparément) pour que getAllDiscussions()
 *   renvoie aussi unread_count.
 */

import supabase from "../utils/supabase"

export type ChatMessage = {
  id: number
  created_at: string
  contenue: string
  sender_id: string
  discussion_id: number
  lu: boolean
  it_delete: boolean
  delete_at: string | null
  epingle: boolean
}

export type Discussion = {
  id: number
  created_at: string
  last_message_at: string | null
  last_message_content: string | null
  user_id: string
  username: string | null
  unread_count?: number
}

export const chatService = {
  // ------------------------------------------------------------------
  // AUTH
  // ------------------------------------------------------------------

  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data.user
  },

  // Inscription : username + email + mot de passe
  // Crée en même temps la discussion de l'utilisateur (user_id = nouveau compte)
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (error) {
      const msg = error.message?.toLowerCase() || ""
      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("user already")
      ) {
        throw new Error("Un compte existe déjà avec cet email. Connecte-toi plutôt.")
      }
      throw error
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error("Un compte existe déjà avec cet email. Connecte-toi plutôt.")
    }

    if (!data.user) {
      throw new Error("Impossible de créer le compte.")
    }

    // Crée immédiatement la discussion liée à ce nouvel utilisateur, avec son username
    await chatService.getOrCreateMyDiscussion(data.user.id, username)

    return data.user
  },

  // Connexion : email + mot de passe uniquement
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data.user
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  isAdmin: (user: any) => {
    return user?.app_metadata?.role === "admin"
  },

  // ------------------------------------------------------------------
  // DISCUSSIONS
  // ------------------------------------------------------------------

  // Récupère (ou crée) la discussion de l'utilisateur connecté avec l'admin
  getOrCreateMyDiscussion: async (userId: string, username?: string) => {
    const { data: existing, error: findError } = await supabase
      .from("Discussion")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (findError) throw findError

    // Si la discussion existe déjà mais que le username n'était pas encore
    // renseigné (compte créé avant l'ajout de ce champ), on le complète.
    if (existing) {
      if (username && !existing.username) {
        const { data: updated, error: updateError } = await supabase
          .from("Discussion")
          .update({ username })
          .eq("id", existing.id)
          .select()
          .single()
        if (updateError) throw updateError
        return updated as Discussion
      }
      return existing as Discussion
    }

    const { data: created, error: createError } = await supabase
      .from("Discussion")
      .insert([{ user_id: userId, username: username || null }])
      .select()
      .single()

    if (createError) throw createError
    return created as Discussion
  },

  // Récupère une discussion précise par son id (vue admin)
  getDiscussionById: async (discussionId: number) => {
    const { data, error } = await supabase
      .from("Discussion")
      .select("*")
      .eq("id", discussionId)
      .single()

    if (error) throw error
    return data as Discussion
  },

  // Liste toutes les discussions (vue admin), triées par dernier message,
  // avec le compteur de messages non lus par discussion.
  getAllDiscussions: async () => {
    const { data, error } = await supabase.rpc("admin_discussions_with_unread")
    if (error) throw error
    return data as Discussion[]
  },

  // ------------------------------------------------------------------
  // MESSAGES
  // ------------------------------------------------------------------

  getMessages: async (discussionId: number) => {
    const { data, error } = await supabase
      .from("Message")
      .select("*")
      .eq("discussion_id", discussionId)
      .eq("it_delete", false)
      .order("created_at", { ascending: true })

    if (error) throw error
    return data as ChatMessage[]
  },

  sendMessage: async (discussionId: number, senderId: string, contenue: string) => {
    const { data, error } = await supabase
      .from("Message")
      .insert([
        {
          discussion_id: discussionId,
          sender_id: senderId,
          contenue,
          lu: false,
          it_delete: false,
          epingle: false,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // met à jour le résumé de la discussion
    await supabase
      .from("Discussion")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_content: contenue,
      })
      .eq("id", discussionId)

    return data as ChatMessage
  },

  // Suppression douce : on garde la ligne mais on la masque
  deleteMessage: async (messageId: number) => {
    const { error } = await supabase
      .from("Message")
      .update({ it_delete: true, delete_at: new Date().toISOString() })
      .eq("id", messageId)

    if (error) throw error
  },

  togglePin: async (messageId: number, currentPinState: boolean) => {
    const { data, error } = await supabase
      .from("Message")
      .update({ epingle: !currentPinState })
      .eq("id", messageId)
      .select()
      .single()

    if (error) throw error
    return data as ChatMessage
  },

  // Marque comme lus tous les messages passés en paramètre.
  // Appelée par l'admin quand il ouvre une discussion (messages du user),
  // ou par le user quand il ouvre le chat (messages de l'admin).
  markAsRead: async (messageIds: number[]) => {
    if (messageIds.length === 0) return
    const { error } = await supabase
      .from("Message")
      .update({ lu: true })
      .in("id", messageIds)

    if (error) throw error
  },

  // Marque comme lus tous les messages non lus d'un expéditeur donné,
  // dans une discussion donnée. Pratique côté admin : on lui passe
  // l'user_id du client pour ne marquer que SES messages comme lus,
  // sans toucher aux messages que l'admin a lui-même envoyés.
  markDiscussionAsReadFrom: async (discussionId: number, senderId: string) => {
    const { error } = await supabase
      .from("Message")
      .update({ lu: true })
      .eq("discussion_id", discussionId)
      .eq("sender_id", senderId)
      .eq("lu", false)

    if (error) throw error
  },

  // ------------------------------------------------------------------
  // REALTIME
  // ------------------------------------------------------------------

  subscribeToDiscussion: (discussionId: number, onChange: () => void) => {
    const channel = supabase
      .channel(`discussion-${discussionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Message",
          filter: `discussion_id=eq.${discussionId}`,
        },
        () => onChange()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  subscribeToAllDiscussions: (onChange: () => void) => {
    const channel = supabase
      .channel("discussions-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Discussion" },
        () => onChange()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Message" },
        () => onChange()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}