'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, Edit2, BookOpen, Layers, GraduationCap } from 'lucide-react';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import { API_URL } from '@/lib/api';

type Tingkat = { id: string; name: string };
type Jurusan = { id: string; name: string; code?: string };
type Kelas = { id: string; name: string; tingkat_id?: string; jurusan_id?: string; tingkat?: Tingkat; jurusan?: Jurusan };

export default function PengaturanAkademikPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.token || (session?.user as any)?.accessToken || '';

  const [activeTab, setActiveTab] = useState<'tingkat' | 'jurusan' | 'kelas'>('tingkat');
  const [tingkats, setTingkats] = useState<Tingkat[]>([]);
  const [jurusans, setJurusans] = useState<Jurusan[]>([]);
  const [kelases, setKelases] = useState<Kelas[]>([]);

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

  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [tingkatName, setTingkatName] = useState('');
  const [jurusanName, setJurusanName] = useState('');
  const [jurusanCode, setJurusanCode] = useState('');
  const [kelasName, setKelasName] = useState('');
  const [kelasTingkatId, setKelasTingkatId] = useState('');
  const [kelasJurusanId, setKelasJurusanId] = useState('');

  const fetchAcademicData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/academic/tree`);
      if (res.ok) {
        const data = await res.json();
        setTingkats(data.tingkats || []);
        setJurusans(data.jurusans || []);
        setKelases(data.kelases || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const resetForm = () => {
    setTingkatName('');
    setJurusanName('');
    setJurusanCode('');
    setKelasName('');
    setKelasTingkatId('');
    setKelasJurusanId('');
    setEditingId(null);
    setModalOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    if (activeTab === 'tingkat') {
      setTingkatName(item.name);
    } else if (activeTab === 'jurusan') {
      setJurusanName(item.name);
      setJurusanCode(item.code || '');
    } else {
      setKelasName(item.name);
      setKelasTingkatId(item.tingkat_id || '');
      setKelasJurusanId(item.jurusan_id || '');
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpointMap = {
      tingkat: `${API_URL}/api/academic/tingkats`,
      jurusan: `${API_URL}/api/academic/jurusans`,
      kelas: `${API_URL}/api/academic/kelases`,
    };

    const url = editingId ? `${endpointMap[activeTab]}/${editingId}` : endpointMap[activeTab];
    const method = editingId ? 'PUT' : 'POST';

    let body = {};
    if (activeTab === 'tingkat') body = { name: tingkatName };
    else if (activeTab === 'jurusan') body = { name: jurusanName, code: jurusanCode };
    else body = { name: kelasName, tingkat_id: kelasTingkatId || null, jurusan_id: kelasJurusanId || null };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        fetchAcademicData();
        resetForm();
      } else {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        showAlert(err.message || err.error || `Gagal menyimpan data (${res.status})`, 'Gagal Menyimpan', 'error');
      }
    } catch (err: any) {
      showAlert(`Terjadi kesalahan: ${err.message || 'Jaringan'}`, 'Kesalahan Koneksi', 'error');
    }
  };

  const handleDelete = (id: string) => {
    showConfirm('Apakah Anda yakin ingin menghapus data akademik ini? Tindakan ini tidak dapat dibatalkan.', async () => {
      setConfirmData({ ...confirmData, isOpen: false });
      const endpointMap = {
        tingkat: `${API_URL}/api/academic/tingkats/${id}`,
        jurusan: `${API_URL}/api/academic/jurusans/${id}`,
        kelas: `${API_URL}/api/academic/kelases/${id}`,
      };

      try {
        const res = await fetch(endpointMap[activeTab], {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchAcademicData();
        } else {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          showAlert(err.message || 'Gagal menghapus data', 'Gagal Hapus', 'error');
        }
      } catch (err: any) {
        showAlert(`Terjadi kesalahan: ${err.message || 'Jaringan'}`, 'Kesalahan Koneksi', 'error');
      }
    }, 'Hapus Data Akademik');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-primary-blue" /> Pengaturan Master Akademik
          </h1>
          <p className="text-sm text-gray-500">Kelola data master Tingkat, Jurusan, dan Kelas untuk keperluan registrasi dan sistem ujian.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary-blue hover:bg-primary-blue-dark text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" /> Tambah Data {activeTab.toUpperCase()}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-2xl w-full max-w-md">
        <button
          onClick={() => setActiveTab('tingkat')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'tingkat' ? 'bg-white text-primary-blue shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Tingkat ({tingkats.length})
        </button>
        <button
          onClick={() => setActiveTab('jurusan')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'jurusan' ? 'bg-white text-primary-blue shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Jurusan ({jurusans.length})
        </button>
        <button
          onClick={() => setActiveTab('kelas')}
          className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === 'kelas' ? 'bg-white text-primary-blue shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> Kelas ({kelases.length})
        </button>
      </div>

      {/* Data Tables */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === 'tingkat' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Tingkat</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tingkats.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">Belum ada data Tingkat</td></tr>
              ) : (
                tingkats.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{t.name}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(t)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'jurusan' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Jurusan</th>
                <th className="px-6 py-4">Singkatan / Kode</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {jurusans.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Belum ada data Jurusan</td></tr>
              ) : (
                jurusans.map((j, idx) => (
                  <tr key={j.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{j.name}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-primary-blue">{j.code || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(j)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(j.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'kelas' && (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Kelas</th>
                <th className="px-6 py-4">Tingkat</th>
                <th className="px-6 py-4">Jurusan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {kelases.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Belum ada data Kelas</td></tr>
              ) : (
                kelases.map((k, idx) => (
                  <tr key={k.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{k.name}</td>
                    <td className="px-6 py-4 text-gray-600">{k.tingkat?.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{k.jurusan?.name || '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(k)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(k.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit' : 'Tambah'} Master {activeTab.toUpperCase()}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'tingkat' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Tingkat</label>
                  <input 
                    type="text" required placeholder="Contoh: X, XI, XII"
                    value={tingkatName} onChange={e => setTingkatName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>
              )}

              {activeTab === 'jurusan' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Jurusan</label>
                    <input 
                      type="text" required placeholder="Contoh: Teknik Komputer dan Jaringan"
                      value={jurusanName} onChange={e => setJurusanName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kode / Singkatan</label>
                    <input 
                      type="text" placeholder="Contoh: TKJ"
                      value={jurusanCode} onChange={e => setJurusanCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                </>
              )}

              {activeTab === 'kelas' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nama / Sub-Kelas</label>
                    <input 
                      type="text" required placeholder="Contoh: A, B, 1, 2"
                      value={kelasName} onChange={e => setKelasName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tingkat (Opsional)</label>
                    <select 
                      value={kelasTingkatId} onChange={e => setKelasTingkatId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue bg-white"
                    >
                      <option value="">-- Pilih Tingkat --</option>
                      {tingkats.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jurusan (Opsional)</label>
                    <select 
                      value={kelasJurusanId} onChange={e => setKelasJurusanId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-blue bg-white"
                    >
                      <option value="">-- Pilih Jurusan --</option>
                      {jurusans.map(j => <option key={j.id} value={j.id}>{j.name} ({j.code || '-'})</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold">Batal</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-primary-blue text-white font-bold hover:bg-primary-blue-dark">Simpan</button>
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
    </div>
  );
}
