import React, { createContext, useContext, useEffect, useState } from 'react'
import supabase from '../utils/supabase'


interface AuthContextType {
  user: any
  isAdmin: boolean
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null)

  // 👉 vérifier session au démarrage + écouter changements
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  // 👉 LOGIN avec Supabase
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    

    if (error) {
      throw new Error(error.message)
   
    }
  }

  // 👉 LOGOUT avec Supabase
  const logout = async () => {
    await supabase.auth.signOut()
  }

  // 👉 ADMIN simple (temporaire)
  const isAdmin = user ? true : false

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}