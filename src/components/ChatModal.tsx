'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, User, Check, CheckCheck, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Comment {
  id: number;
  attempt_id: string;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  user: {
    id: number;
    name: string;
    role: string;
    avatar?: string;
  };
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptId: string;
  title: string;
}

export default function ChatModal({ isOpen, onClose, attemptId, title }: ChatModalProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && attemptId && session?.user?.token) {
      fetchComments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, attemptId, session?.user?.token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/attempts/${attemptId}/comments`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setComments(data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`http://localhost:8000/api/attempts/${attemptId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`
        },
        body: JSON.stringify({ message: newMessage.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setComments([...comments, data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error(error);
    }
    setSending(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-200"
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        visibility: isOpen ? 'visible' : 'hidden',
      }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col h-[600px] max-h-[90vh] transition-all duration-200"
        style={{
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          opacity: isOpen ? 1 : 0,
        }}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Komentar & Diskusi</h3>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-gray-300" />
              </div>
              <p>Belum ada komentar. Mulai diskusi!</p>
            </div>
          ) : (
            comments.map((comment, index) => {
              const isMine = comment.user_id === Number((session?.user as any)?.id);
              const showAvatar = index === 0 || comments[index - 1].user_id !== comment.user_id;

              return (
                <div key={comment.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
                  {!isMine && showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0 overflow-hidden">
                      {comment.user?.avatar ? (
                        <img src={`http://localhost:8000/storage/${comment.user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-primary-blue" />
                      )}
                    </div>
                  )}
                  {!isMine && !showAvatar && <div className="w-8 mr-2 shrink-0" />}

                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMine ? 'bg-primary-blue text-white rounded-tr-sm' : 'bg-white border text-gray-800 rounded-tl-sm shadow-sm'}`}>
                    {!isMine && showAvatar && (
                      <p className="text-xs font-semibold mb-1 opacity-75">{comment.user?.name} <span className="font-normal text-[10px] ml-1">({comment.user?.role})</span></p>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{comment.message}</p>
                    <div className={`flex items-center justify-end mt-1 gap-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                      <span className="text-[10px]">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMine && (
                        comment.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t rounded-b-2xl">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tulis pesan..."
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 rounded-xl px-4 py-3 text-sm transition-all outline-none"
              disabled={sending}
            />
            <button 
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-primary-blue hover:bg-primary-blue-light text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
