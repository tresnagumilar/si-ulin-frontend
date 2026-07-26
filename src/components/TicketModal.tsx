'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, User, Loader2, Info } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Ticket {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    role: string;
    avatar?: string;
  };
  replies: TicketReply[];
}

interface TicketReply {
  id: number;
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

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  onStatusChange?: (id: number, status: string) => void;
}

export default function TicketModal({ isOpen, onClose, ticketId, onStatusChange }: TicketModalProps) {
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (isOpen && ticketId && session?.user) {
      fetchTicket();
    }
  }, [isOpen, ticketId, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.replies]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${(session?.user as any)?.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
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
      const res = await fetch(`http://localhost:8000/api/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session?.user as any)?.token}`
        },
        body: JSON.stringify({ message: newMessage.trim() })
      });
      if (res.ok) {
        const reply = await res.json();
        setTicket(prev => prev ? { 
          ...prev, 
          replies: [...prev.replies, reply],
          status: userRole === 'ADMIN' && prev.status === 'open' ? 'answered' : (userRole !== 'ADMIN' && prev.status === 'answered' ? 'open' : prev.status)
        } : null);
        setNewMessage('');
      }
    } catch (error) {
      console.error(error);
    }
    setSending(false);
  };

  const updateStatus = async (newStatus: string) => {
    if (userRole !== 'ADMIN') return;
    try {
      const res = await fetch(`http://localhost:8000/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session?.user as any)?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTicket(prev => prev ? { ...prev, status: newStatus } : null);
        if (onStatusChange) onStatusChange(ticketId, newStatus);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col h-[650px] max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 overflow-hidden pr-4">
            <h3 className="font-bold text-gray-800 text-lg truncate">{ticket?.subject || 'Memuat...'}</h3>
            <div className="flex items-center gap-2 mt-1">
              {ticket && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'answered' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {ticket.status}
                </span>
              )}
              {ticket && (
                <span className="text-xs text-gray-500">
                  oleh {ticket.user.name} ({ticket.user.role})
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Controls */}
        {userRole === 'ADMIN' && ticket && ticket.status !== 'closed' && (
          <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center text-sm">
            <span className="text-gray-500 text-xs flex items-center gap-1"><Info className="w-4 h-4"/> Tindakan Admin</span>
            <button 
              onClick={() => updateStatus('closed')}
              className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md font-semibold transition-colors"
            >
              Tutup Tiket
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 relative">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
            </div>
          ) : ticket?.replies?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>Belum ada balasan.</p>
            </div>
          ) : (
            ticket?.replies.map((reply, index) => {
              const isMine = reply.user_id === Number((session?.user as any)?.id);
              const showAvatar = index === 0 || ticket.replies[index - 1].user_id !== reply.user_id;
              const isSystemAdmin = reply.user.role === 'ADMIN';

              return (
                <div key={reply.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
                  {!isMine && showAvatar && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 shrink-0 overflow-hidden ${isSystemAdmin ? 'bg-purple-100' : 'bg-blue-100'}`}>
                      {reply.user?.avatar ? (
                        <img src={`http://localhost:8000/storage/${reply.user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className={`w-4 h-4 ${isSystemAdmin ? 'text-purple-600' : 'text-primary-blue'}`} />
                      )}
                    </div>
                  )}
                  {!isMine && !showAvatar && <div className="w-8 mr-2 shrink-0" />}

                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? 'bg-primary-blue text-white rounded-tr-sm' : 
                    isSystemAdmin ? 'bg-purple-50 border border-purple-100 text-gray-800 rounded-tl-sm' : 
                    'bg-white border text-gray-800 rounded-tl-sm shadow-sm'
                  }`}>
                    {!isMine && showAvatar && (
                      <p className={`text-xs font-semibold mb-1 opacity-75 ${isSystemAdmin ? 'text-purple-700' : ''}`}>
                        {reply.user?.name} {isSystemAdmin ? '🛡️' : ''} 
                        <span className="font-normal text-[10px] ml-1">({reply.user?.role})</span>
                      </p>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                    <div className={`flex items-center justify-end mt-1 gap-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                      <span className="text-[10px]">{new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
          {ticket?.status === 'closed' ? (
            <div className="text-center py-2 text-gray-500 font-medium">
              Tiket ini sudah ditutup.
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
