import React, { useEffect, useRef, useState } from "react"
import { Send, Trash2, Pin, PinOff, Loader2, MapPin } from "lucide-react"
import { chatService, type ChatMessage, type Discussion } from "../service/chatService"

const LOCATION_PREFIX = "__LOC__"

const parseLocation = (contenue: string): { lat: number; lng: number } | null => {
  if (!contenue.startsWith(LOCATION_PREFIX)) return null
  const [lat, lng] = contenue.replace(LOCATION_PREFIX, "").split(",").map(Number)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
}

// Page réservée à l'administrateur : /admin/chat
export const AdminChat = () => {
  const [admin, setAdmin] = useState<any>(null)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [selected, setSelected] = useState<Discussion | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const u = await chatService.getCurrentUser()
      setAdmin(u)
      if (u && chatService.isAdmin(u)) {
        const all = await chatService.getAllDiscussions()
        setDiscussions(all)
      }
      setLoading(false)
    }
    init()

    const unsubscribe = chatService.subscribeToAllDiscussions(async () => {
      const all = await chatService.getAllDiscussions()
      setDiscussions(all)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!selected) return
    let unsubscribe: (() => void) | undefined

    const load = async () => {
      const msgs = await chatService.getMessages(selected.id)
      setMessages(msgs)
      unsubscribe = chatService.subscribeToDiscussion(selected.id, async () => {
        const refreshed = await chatService.getMessages(selected.id)
        setMessages(refreshed)
      })
    }
    load()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [selected])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!draft.trim() || !selected || !admin) return
    await chatService.sendMessage(selected.id, admin.id, draft.trim())
    setDraft("")
  }

  const handleDelete = async (id: number) => {
    await chatService.deleteMessage(id)
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const handleTogglePin = async (m: ChatMessage) => {
    const updated = await chatService.togglePin(m.id, m.epingle)
    setMessages((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
      </div>
    )
  }

  if (!admin || !chatService.isAdmin(admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Cette page est réservée à l'administrateur.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 flex">
      {/* Liste des discussions */}
      <aside className="w-80 bg-white border-r border-gray-100 overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Discussions</h2>
        </div>
        {discussions.length === 0 && (
          <p className="text-sm text-gray-400 p-4">Aucune discussion pour le moment.</p>
        )}
        {discussions.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d)}
            className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-pink-50 transition-colors ${
              selected?.id === d.id ? "bg-pink-100" : ""
            }`}
          >
            <p className="text-sm font-medium text-gray-800 truncate">
              Utilisateur {d.user_id.slice(0, 8)}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {d.last_message_content || "Pas encore de message"}
            </p>
          </button>
        ))}
      </aside>

      {/* Fil de discussion sélectionné */}
      <main className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Sélectionne une discussion à gauche
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.map((m) => {
                const isMine = m.sender_id === admin.id
                const location = parseLocation(m.contenue)
                return (
                  <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                    {location ? (
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps?q=${location.lat},${location.lng}`,
                            "_blank"
                          )
                        }
                        className={`max-w-[60%] rounded-2xl px-3 py-2 text-sm flex items-center gap-2 hover:opacity-90 transition-opacity ${
                          isMine
                            ? "bg-pink-600 text-white rounded-br-sm"
                            : "bg-white border border-gray-200 rounded-bl-sm"
                        }`}
                      >
                        {m.epingle && <Pin className="w-3 h-3 opacity-80" />}
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>Position partagée — ouvrir dans Maps</span>
                      </button>
                    ) : (
                      <div
                        className={`max-w-[60%] rounded-2xl px-3 py-2 text-sm ${
                          isMine
                            ? "bg-pink-600 text-white rounded-br-sm"
                            : "bg-white border border-gray-200 rounded-bl-sm"
                        }`}
                      >
                        {m.epingle && <Pin className="w-3 h-3 inline mr-1 -mt-0.5 opacity-80" />}
                        {m.contenue}
                      </div>
                    )}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => handleTogglePin(m)}
                        className="text-[11px] text-gray-400 hover:text-pink-600 flex items-center gap-0.5"
                      >
                        {m.epingle ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                      </button>
                      {isMine && (
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2 bg-white">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Répondre..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button
                onClick={handleSend}
                disabled={!draft.trim()}
                className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}