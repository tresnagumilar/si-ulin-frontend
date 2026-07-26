'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HelpCircle, RefreshCw, MessageSquare, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import TicketModal from '@/components/TicketModal';

export default function AdminLaporanPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('all');

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
      const res = await fetch('http://localhost:8000/api/tickets', {
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

  const handleStatusChange = (id: number, newStatus: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const filteredTickets = tickets.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan Pengguna</h1>
          <p className="text-gray-500">Kelola dan tanggapi keluhan atau permintaan dari guru dan siswa.</p>
        </div>
      </div>

      {/* Stats/Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-gray-800 text-white shadow-sm' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
        >
          Semua Laporan ({tickets.length})
        </button>
        <button 
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'open' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white border text-yellow-600 hover:bg-yellow-50'}`}
        >
          <ShieldAlert className="w-4 h-4"/> Menunggu ({tickets.filter(t => t.status === 'open').length})
        </button>
        <button 
          onClick={() => setFilter('answered')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'answered' ? 'bg-blue-500 text-white shadow-sm' : 'bg-white border text-blue-600 hover:bg-blue-50'}`}
        >
          <Clock className="w-4 h-4"/> Dijawab ({tickets.filter(t => t.status === 'answered').length})
        </button>
        <button 
          onClick={() => setFilter('closed')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${filter === 'closed' ? 'bg-gray-300 text-gray-800 shadow-sm' : 'bg-white border text-gray-500 hover:bg-gray-50'}`}
        >
          <CheckCircle className="w-4 h-4"/> Selesai ({tickets.filter(t => t.status === 'closed').length})
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gray-400" /> Daftar Laporan
          </h2>
          <button onClick={fetchTickets} className="p-2 text-gray-400 hover:text-primary-blue transition-colors rounded-lg hover:bg-blue-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Memuat data...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Tidak ada laporan</h3>
            <p className="text-gray-500 text-sm">Belum ada laporan dalam kategori ini.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTickets.map(ticket => (
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      ticket.user.role === 'GURU' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-purple-50 text-purple-700 border-purple-200'
                    }`}>
                      {ticket.user.role}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500 mt-1">Oleh: {ticket.user.name} • {ticket.replies_count} Balasan</p>
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
          onClose={() => {
            setModalOpen(false);
            fetchTickets();
          }} 
          ticketId={selectedTicketId}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
