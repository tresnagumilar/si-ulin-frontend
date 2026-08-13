'use client';
import { useState, useEffect } from 'react';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import { API_URL } from '@/lib/api';

export default function BankSoalList({ token }: { token: string }) {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBank, setNewBank] = useState({ title: '', subject: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Alert & Confirm Modals
  const [alertData, setAlertData] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'error' | 'warning' | 'info' | 'success' }>({
    isOpen: false, message: ''
  });
  const [confirmData, setConfirmData] = useState<{ isOpen: boolean; title?: string; message: string; onConfirm: () => void }>({
    isOpen: false, message: '', onConfirm: () => {}
  });

  const showAlert = (message: string, title = 'Pemberitahuan', type: 'error' | 'warning' | 'info' | 'success' = 'warning') => {
    setAlertData({ isOpen: true, title, message, type });
  };

  const showConfirm = (message: string, onConfirm: () => void, title = 'Konfirmasi Hapus') => {
    setConfirmData({ isOpen: true, title, message, onConfirm });
  };

  const fetchBanks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/question-banks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setBanks(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/question-banks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBank)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewBank({ title: '', subject: '' });
        fetchBanks();
        showAlert('Bank Soal berhasil dibuat!', 'Berhasil', 'success');
      } else {
        showAlert("Gagal membuat bank soal.", "Gagal", "error");
      }
    } catch (e) {
      showAlert("Terjadi kesalahan jaringan saat membuat bank soal.", "Error", "error");
    }
    setIsSubmitting(false);
  };

  const handleDelete = (id: string) => {
    showConfirm("Apakah Anda yakin ingin menghapus Bank Soal ini beserta seluruh isi soal di dalamnya secara permanen?", async () => {
      setConfirmData({ ...confirmData, isOpen: false });
      try {
        const res = await fetch(`${API_URL}/api/question-banks/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchBanks();
          showAlert('Bank Soal berhasil dihapus.', 'Berhasil', 'success');
        } else {
          showAlert('Gagal menghapus Bank Soal.', 'Gagal', 'error');
        }
      } catch (e) {
        console.error(e);
        showAlert('Terjadi kesalahan jaringan saat menghapus.', 'Error', 'error');
      }
    });
  };

  if (loading) return <div className="text-center p-12 text-gray-500 font-medium">Memuat data...</div>;

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-blue hover:bg-primary-blue-dark text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" /> Buat Bank Soal Baru
        </button>
      </div>

      {banks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Bank Soal</h3>
          <p className="text-gray-500 max-w-md">Buat bank soal pertama Anda untuk mulai mengumpulkan dan mengelola soal-soal ujian secara terpusat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map(bank => (
            <div key={bank.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-primary-blue rounded-2xl">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <button onClick={() => handleDelete(bank.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">{bank.title}</h3>
              <p className="text-sm font-medium text-primary-blue mb-4">{bank.subject}</p>
              
              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <strong className="text-gray-900">{bank.questions_count}</strong> Soal Tersimpan
                </div>
                <Link 
                  href={`/guru/bank-soal/${bank.id}`}
                  className="px-4 py-2 bg-gray-50 text-gray-700 hover:bg-primary-blue hover:text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Kelola Soal
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-150">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Buat Bank Soal Baru</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Bank Soal</label>
                <input 
                  type="text" required 
                  placeholder="Contoh: Kumpulan Soal UTS Fisika Kelas X"
                  value={newBank.title} onChange={e => setNewBank({...newBank, title: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mata Pelajaran</label>
                <input 
                  type="text" required 
                  placeholder="Contoh: Fisika Dasar"
                  value={newBank.subject} onChange={e => setNewBank({...newBank, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 text-white font-bold bg-primary-blue hover:bg-primary-blue-dark rounded-xl transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Menyimpan...' : 'Buat Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={alertData.isOpen}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
      />

      <ConfirmModal
        isOpen={confirmData.isOpen}
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={confirmData.onConfirm}
        onCancel={() => setConfirmData({ ...confirmData, isOpen: false })}
      />
    </>
  );
}
