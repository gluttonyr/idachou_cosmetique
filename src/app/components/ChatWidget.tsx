import React, { useEffect, useRef, useState } from "react"
import { MessageCircle, X, Send, Trash2, Pin, PinOff, Loader2, MapPin } from "lucide-react"
import { chatService, type ChatMessage, type Discussion } from "../service/chatService"

// Les messages de position sont encodés dans `contenue` avec ce préfixe,
// car la table Message n'a qu'une colonne texte.
const LOCATION_PREFIX = "__LOC__"

const parseLocation = (contenue: string): { lat: number; lng: number } | null => {
  if (!contenue.startsWith(LOCATION_PREFIX)) return null
  const [lat, lng] = contenue.replace(LOCATION_PREFIX, "").split(",").map(Number)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

export const ChatWidget = () => {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [sendingLocation, setSendingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // --- formulaire auth ---
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Vérifie si un utilisateur est déjà connecté
  useEffect(() => {
    chatService.getCurrentUser().then((u) => {
      setUser(u)
      setCheckingAuth(false)
    })
  }, [])

  // Charge (ou crée) la discussion + les messages une fois connecté et le panneau ouvert
  useEffect(() => {
    if (!open || !user) return

    let unsubscribe: (() => void) | undefined

    const load = async () => {
      const d = await chatService.getOrCreateMyDiscussion(
        user.id,
        user.user_metadata?.username
      )
      setDiscussion(d)
      const msgs = await chatService.getMessages(d.id)
      setMessages(msgs)

      unsubscribe = chatService.subscribeToDiscussion(d.id, async () => {
        const refreshed = await chatService.getMessages(d.id)
        setMessages(refreshed)
      })
    }

    load()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [open, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)
    try {
      if (mode === "signup") {
        const newUser = await chatService.signUp(email, password, username)
        setUser(newUser)
      } else {
        const loggedUser = await chatService.signIn(email, password)
        setUser(loggedUser)
      }
    } catch (err: any) {
      setAuthError(err.message || "Une erreur est survenue")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSend = async () => {
    if (!draft.trim() || !discussion || !user) return
    setSending(true)
    try {
      await chatService.sendMessage(discussion.id, user.id, draft.trim())
      setDraft("")
      const refreshed = await chatService.getMessages(discussion.id)
      setMessages(refreshed)
    } finally {
      setSending(false)
    }
  }

  const handleShareLocation = () => {
    if (!discussion || !user) return

    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par ton navigateur.")
      return
    }

    setLocationError(null)
    setSendingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          await chatService.sendMessage(
            discussion.id,
            user.id,
            `${LOCATION_PREFIX}${latitude},${longitude}`
          )
          const refreshed = await chatService.getMessages(discussion.id)
          setMessages(refreshed)
        } finally {
          setSendingLocation(false)
        }
      },
      (err) => {
        setSendingLocation(false)
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Autorise l'accès à ta position pour la partager."
            : "Impossible de récupérer ta position."
        )
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleDelete = async (messageId: number) => {
    await chatService.deleteMessage(messageId)
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
  }

  const handleTogglePin = async (message: ChatMessage) => {
    const updated = await chatService.togglePin(message.id, message.epingle)
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
  }

  return (
    <>
      {/* Icône flottante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-pink-600 text-white shadow-lg hover:bg-pink-700 hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Ouvrir le chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Panneau de chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[90vw] h-[500px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-pink-100 flex flex-col overflow-hidden">
          <div className="bg-pink-600 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">Discuter avec nous</span>
            <button onClick={() => setOpen(false)} aria-label="Fermer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {checkingAuth ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
            </div>
          ) : !user ? (
            // ---- Formulaire connexion / inscription ----
            <div className="flex-1 p-5 overflow-y-auto">
              <div className="flex mb-4 rounded-lg bg-pink-50 p-1">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "login" ? "bg-white shadow text-pink-700" : "text-pink-500"
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === "signup" ? "bg-white shadow text-pink-700" : "text-pink-500"
                  }`}
                >
                  Créer un compte
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {mode === "signup" && (
                  <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />

                {authError && <p className="text-red-500 text-xs">{authError}</p>}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-pink-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-pink-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === "signup" ? "Créer mon compte" : "Se connecter"}
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Tu dois être connecté pour envoyer un message.
              </p>
            </div>
          ) : (
            // ---- Fil de discussion ----
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-pink-50/40">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-gray-400 mt-8">
                    Envoie ton premier message 👋
                  </p>
                )}
                {messages.map((m) => {
                  const isMine = m.sender_id === user.id
                  const location = parseLocation(m.contenue)
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      {location ? (
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${location.lat},${location.lng}`,
                              "_blank"
                            )
                          }
                          className={`relative max-w-[80%] rounded-2xl px-3 py-2 text-sm flex items-center gap-2 hover:opacity-90 transition-opacity ${
                            isMine
                              ? "bg-pink-600 text-white rounded-br-sm"
                              : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          {m.epingle && <Pin className="w-3 h-3 opacity-80" />}
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span>Position partagée — ouvrir dans Maps</span>
                        </button>
                      ) : (
                        <div
                          className={`relative max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                            isMine
                              ? "bg-pink-600 text-white rounded-br-sm"
                              : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          {m.epingle && (
                            <Pin className="w-3 h-3 inline mr-1 -mt-0.5 opacity-80" />
                          )}
                          {m.contenue}
                        </div>
                      )}
                      {isMine && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleTogglePin(m)}
                            className="text-[11px] text-gray-400 hover:text-pink-600 flex items-center gap-0.5"
                          >
                            {m.epingle ? (
                              <>
                                <PinOff className="w-3 h-3" /> Désépingler
                              </>
                            ) : (
                              <>
                                <Pin className="w-3 h-3" /> Épingler
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-0.5"
                          >
                            <Trash2 className="w-3 h-3" /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-100">
                {locationError && (
                  <p className="text-[11px] text-red-500 px-3 pt-2">{locationError}</p>
                )}
                <div className="p-3 flex gap-2 items-center">
                  <button
                    onClick={handleShareLocation}
                    disabled={sendingLocation}
                    title="Partager ma position"
                    aria-label="Partager ma position"
                    className="w-10 h-10 shrink-0 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 disabled:opacity-50 transition-colors"
                  >
                    {sendingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Écris ton message..."
                    className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    className="w-10 h-10 shrink-0 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 disabled:opacity-50 transition-colors"
                    aria-label="Envoyer"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}