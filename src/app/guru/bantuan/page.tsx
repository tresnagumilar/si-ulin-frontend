'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, HelpCircle, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';
import TicketModal from '@/components/TicketModal';
import { API_URL } from '@/lib/api';

export default function GuruBantuanPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New ticket form
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal state
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchTickets();
    }
  }, [session]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        headers: { 'Authorization': `Bearer ${(session?.user as any)?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session?.user as any)?.token}`
        },
        body: JSON.stringify({ subject, message })
      });
      
      if (res.ok) {
        setSubject('');
        setMessage('');
        setShowForm(false);
        fetchTickets(); // refresh list
      } else {
        alert('Gagal membuat laporan.');
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan.');
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pusat Bantuan & Laporan</h1>
          <p className="text-gray-500">Sampaikan keluhan, pertanyaan, atau kendala Anda di sini.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-blue hover:bg-primary-blue-light text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
        >
          {showForm ? <XIcon className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Batal' : 'Buat Laporan'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary-blue" /> Laporan Baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subjek / Topik</label>
              <input 
                type="text" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Contoh: Fitur input nilai bermasalah"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Detail Masalah</label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Jelaskan kendala Anda secara detail..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none transition-all min-h-[120px]"
                required
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gray-400" /> Riwayat Laporan Anda
          </h2>
          <button onClick={fetchTickets} className="p-2 text-gray-400 hover:text-primary-blue transition-colors rounded-lg hover:bg-blue-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Memuat data...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Belum ada laporan</h3>
            <p className="text-gray-500 text-sm">Anda belum pernah membuat laporan atau pertanyaan.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map(ticket => (
              <div 
                key={ticket.id} 
                onClick={() => { setSelectedTicketId(ticket.id); setModalOpen(true); }}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      ticket.status === 'open' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      ticket.status === 'answered' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">{ticket.replies_count} Balasan pesan</p>
                </div>
                <div className="text-primary-blue bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors self-start sm:self-auto flex items-center gap-2">
                   Buka <MessageSquare className="w-4 h-4"/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTicketId && (
        <TicketModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          ticketId={selectedTicketId}
        />
      )}
    </div>
  );
}

function XIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
