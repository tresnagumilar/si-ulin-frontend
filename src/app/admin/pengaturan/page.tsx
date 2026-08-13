'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, User, Lock, Save, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import AlertModal from '@/components/AlertModal';

export default function PengaturanAdminPage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  
  const user = session?.user as any;
  const token = user?.token;

  const [activeTab, setActiveTab] = useState<'sekolah' | 'profile' | 'password'>('sekolah');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Alert Modal
  const [alertData, setAlertData] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'error' | 'warning' | 'info' | 'success' }>({
    isOpen: false, message: ''
  });

  const showAlert = (message: string, title = 'Pemberitahuan', type: 'error' | 'warning' | 'info' | 'success' = 'info') => {
    setAlertData({ isOpen: true, title, message, type });
  };

  // School State (Mocked for UI for now)
  const [sekolah, setSekolah] = useState({ nama: 'SMKN 9', tahunAjaran: '2025/2026', deskripsi: 'Platform Ujian Berbasis Komputer' });

  // Profile State
  const [profile, setProfile] = useState({ name: '' });
  const [originalProfile, setOriginalProfile] = useState({ name: '' });

  // Password State
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', new_password_confirmation: '' });

  useEffect(() => {
    if (user) {
      const loaded = { name: user.name || '' };
      setProfile(loaded);
      setOriginalProfile(loaded);
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profile.name === originalProfile.name) {
      setMessage({ type: 'error', text: 'Tidak ada perubahan data profil yang dirubah.' });
      showAlert('Tidak ada perubahan data pada profil Anda.', 'Tidak Ada Perubahan', 'info');
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_URL}/api/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();

      if (res.ok) {
        setOriginalProfile({ ...profile });
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        showAlert('Profil Anda telah berhasil diperbarui dan disimpan!', 'Berhasil Simpan', 'success');
        await update({ name: profile.name });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal memperbarui profil' });
        showAlert(data.message || 'Gagal memperbarui profil Anda.', 'Gagal Simpan', 'error');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' });
      showAlert('Terjadi kesalahan jaringan saat menyimpan profil.', 'Kesalahan Koneksi', 'error');
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (passwords.new_password !== passwords.new_password_confirmation) {
      setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
      showAlert('Konfirmasi password baru tidak cocok!', 'Peringatan', 'warning');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwords)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Password berhasil diubah!' });
        showAlert('Password Anda telah berhasil diubah!', 'Berhasil Ubah Password', 'success');
        setPasswords({ old_password: '', new_password: '', new_password_confirmation: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mengubah password' });
        showAlert(data.message || 'Gagal mengubah password Anda.', 'Gagal Ubah Password', 'error');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' });
      showAlert('Terjadi kesalahan jaringan saat mengubah password.', 'Kesalahan Koneksi', 'error');
    }
    setIsLoading(false);
  };

  const handleSekolahSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    // Mock save
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Pengaturan sekolah berhasil disimpan!' });
      setIsLoading(false);
    }, 1000);
  };

  if (status === 'loading') return null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center text-gray-600">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Admin</h1>
          <p className="text-gray-500">Konfigurasi sistem dan manajemen akun</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('sekolah'); setMessage({ type: '', text: ''}); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'sekolah' ? 'bg-blue-50 text-primary-blue' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-5 h-5" /> Info Sekolah
          </button>
          <button
            onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: ''}); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-blue-50 text-primary-blue' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" /> Profil Admin
          </button>
          <button
            onClick={() => { setActiveTab('password'); setMessage({ type: '', text: ''}); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'password' ? 'bg-blue-50 text-primary-blue' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Lock className="w-5 h-5" /> Keamanan Sandi
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <Settings className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {activeTab === 'sekolah' && (
            <form onSubmit={handleSekolahSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Informasi Sekolah</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Sekolah</label>
                  <input 
                    type="text" 
                    value={sekolah.nama}
                    onChange={e => setSekolah({...sekolah, nama: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Ajaran</label>
                  <input 
                    type="text" 
                    value={sekolah.tahunAjaran}
                    onChange={e => setSekolah({...sekolah, tahunAjaran: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Aplikasi</label>
                <textarea 
                  rows={3}
                  value={sekolah.deskripsi}
                  onChange={e => setSekolah({...sekolah, deskripsi: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={isLoading} className="bg-primary-blue hover:bg-primary-blue-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Profil Admin</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" required
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={isLoading} className="bg-primary-blue hover:bg-primary-blue-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Profil
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Ubah Password</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                <input 
                  type="password" required minLength={6}
                  value={passwords.old_password}
                  onChange={e => setPasswords({...passwords, old_password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                <input 
                  type="password" required minLength={6}
                  value={passwords.new_password}
                  onChange={e => setPasswords({...passwords, new_password: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                <input 
                  type="password" required minLength={6}
                  value={passwords.new_password_confirmation}
                  onChange={e => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={isLoading} className="bg-primary-blue hover:bg-primary-blue-dark text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Ubah Password
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      <AlertModal
        isOpen={alertData.isOpen}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
      />
    </div>
  );
}
