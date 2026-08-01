import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Trash2, Pin, PinOff, Loader2, MapPin } from 'lucide-react';
import { chatService, type ChatMessage, type Discussion } from '../service/chatService';

const LOCATION_PREFIX = '__LOC__';

const parseLocation = (contenue: string): { lat: number; lng: number } | null => {
  if (!contenue.startsWith(LOCATION_PREFIX)) return null;
  const [lat, lng] = contenue.replace(LOCATION_PREFIX, '').split(',').map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
};

export const AdminDiscussionChat = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const discussionId = Number(id);

  const [admin, setAdmin] = useState<any>(null);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!discussionId) return;
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        setLoading(true);
        const currentUser = await chatService.getCurrentUser();
        setAdmin(currentUser);

        const d = await chatService.getDiscussionById(discussionId);
        setDiscussion(d);

        const msgs = await chatService.getMessages(discussionId);
        setMessages(msgs);

        // Marque comme lus tous les messages envoyés par CE client
        // (on ne touche pas aux messages que l'admin a lui-même envoyés).
        // C'est ce qui fait retomber le badge "non lu" à zéro dans la liste.
        await chatService.markDiscussionAsReadFrom(discussionId, d.user_id);

        unsubscribe = chatService.subscribeToDiscussion(discussionId, async () => {
          const refreshed = await chatService.getMessages(discussionId);
          setMessages(refreshed);

          // Si un nouveau message du client arrive pendant que l'admin
          // a la conversation ouverte, on le marque lu immédiatement
          // plutôt que d'attendre une future ouverture.
          await chatService.markDiscussionAsReadFrom(discussionId, d.user_id);
        });
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [discussionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!draft.trim() || !discussion || !admin) return;
    setSending(true);
    try {
      await chatService.sendMessage(discussion.id, admin.id, draft.trim());
      setDraft('');
      const refreshed = await chatService.getMessages(discussion.id);
      setMessages(refreshed);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (messageId: number) => {
    await chatService.deleteMessage(messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const handleTogglePin = async (message: ChatMessage) => {
    const updated = await chatService.togglePin(message.id, message.epingle);
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm">Discussion introuvable.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <button
          onClick={() => navigate('/admin/discussions')}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)' }}
        >
          {(discussion.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">
            {discussion.username || `Utilisateur ${discussion.user_id.slice(0, 8)}`}
          </p>
          <p className="text-xs text-gray-400">Conversation client</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50/50">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">
            Aucun message pour l'instant
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.sender_id === admin?.id;
          const location = parseLocation(m.contenue);
          return (
            <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              {location ? (
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${location.lat},${location.lng}`,
                      '_blank'
                    )
                  }
                  className={`max-w-[60%] rounded-2xl px-3 py-2 text-sm flex items-center gap-2 hover:opacity-90 transition-opacity ${
                    isMine
                      ? 'bg-pink-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 rounded-bl-sm'
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
                      ? 'bg-pink-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 rounded-bl-sm'
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
                {isMine && (
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-[11px] text-gray-400 hover:text-red-500 flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Répondre..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 disabled:opacity-50 transition-colors"
          aria-label="Envoyer"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};