import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from '../utils/supabase'

interface AuthContextType {
  user: any
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Un compte est admin uniquement si son app_metadata.role vaut "admin".
// app_metadata (raw_app_meta_data côté DB) ne peut être modifié que par un
// service role côté serveur — jamais par l'utilisateur lui-même. C'est donc
// la seule source fiable pour un contrôle de rôle. Ne jamais utiliser
// user_metadata pour ça : un utilisateur peut le modifier lui-même via
// supabase.auth.updateUser().
const checkIsAdmin = (user: any) => user?.app_metadata?.role === 'admin'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 👉 vérifier session au démarrage + écouter changements
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  // 👉 LOGIN avec Supabase — refuse et déconnecte immédiatement si le compte
  // connecté n'a pas le rôle admin, pour ne jamais laisser une session
  // "client" traîner sur l'espace d'administration, même brièvement.
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!checkIsAdmin(data.user)) {
      await supabase.auth.signOut()
      throw new Error("Ce compte n'a pas les droits administrateur.")
    }
  }

  // 👉 LOGOUT avec Supabase
  const logout = async () => {
    await supabase.auth.signOut()
  }

  const isAdmin = checkIsAdmin(user)

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}