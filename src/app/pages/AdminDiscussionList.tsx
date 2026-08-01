import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2, ChevronRight } from 'lucide-react';
import { chatService, type Discussion } from '../service/chatService';

const LOCATION_PREFIX = '__LOC__';

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const previewText = (content: string | null) => {
  if (!content) return 'Pas encore de message';
  if (content.startsWith(LOCATION_PREFIX)) return '📍 Position partagée';
  return content;
};

export const AdminDiscussionsList = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const load = async () => {
      try {
        setLoading(true);
        const data = await chatService.getAllDiscussions();
        setDiscussions(data);
      } finally {
        setLoading(false);
      }
    };

    load();

    unsubscribe = chatService.subscribeToAllDiscussions(async () => {
      const data = await chatService.getAllDiscussions();
      setDiscussions(data);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Discussions</h2>
        <p className="text-gray-500 text-sm">
          Toutes les conversations avec les utilisateurs de la plateforme
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {discussions.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Aucune discussion pour le moment</p>
          </div>
        ) : (
          discussions.map((d) => {
            const hasUnread = !!d.unread_count && d.unread_count > 0;
            return (
              <button
                key={d.id}
                onClick={() => navigate(`/admin/discussions/${d.id}`)}
                className="w-full flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-pink-50 transition-colors text-left"
              >
                <div className="relative shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)' }}
                  >
                    {(d.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-pink-600 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm truncate ${
                        hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                      }`}
                    >
                      {d.username || `Utilisateur ${d.user_id.slice(0, 8)}`}
                    </p>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatDate(d.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p
                      className={`text-sm truncate ${
                        hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500'
                      }`}
                    >
                      {previewText(d.last_message_content)}
                    </p>
                    {hasUnread && (
                      <span className="bg-pink-600 text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                        {d.unread_count! > 9 ? '9+' : d.unread_count}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};