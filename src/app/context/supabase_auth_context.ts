// import { useEffect, useState } from "react"
// import supabase from "../utils/supabase"

// function App() {
//   const [user, setUser] = useState(null)

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data }) => {
//       setUser(data.user)
//     })

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         setUser(session?.user ?? null)
//       }
//     )

//     return () => listener.subscription.unsubscribe()
//   }, [])

//   return user ? <AdminDashboard /> : <Login />
// }