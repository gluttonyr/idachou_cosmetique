/**
 * Service d'authentification
 */

import supabase from "../utils/supabase";


export const authService = {
 signIn: async(email:string, password:string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
},
logout: async() => {
  await supabase.auth.signOut()
}
};
