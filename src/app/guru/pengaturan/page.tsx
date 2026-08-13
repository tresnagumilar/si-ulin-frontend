'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, User, Lock, Save, Loader2, CheckCircle2 } from 'lucide-react';
import AlertModal from '@/components/AlertModal';
import { API_URL } from '@/lib/api';

export default function PengaturanGuruPage() {
  const { data: session, update } = useSession();
  const user = session?.user as any;
  const token = user?.token;

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Custom Alert Modal State
  const [alertData, setAlertData] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'error' | 'warning' | 'info' | 'success' }>({
    isOpen: false, message: ''
  });

  const showAlert = (message: string, title = 'Pemberitahuan', type: 'error' | 'warning' | 'info' | 'success' = 'info') => {
    setAlertData({ isOpen: true, title, message, type });
  };

  // Profile State
  const [profile, setProfile] = useState({ name: '', subject: '', nuptk: '', email: '' });

  // Password State
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', new_password_confirmation: '' });

  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/api/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(u => {
        setProfile({ name: u.name || '', subject: u.subject || '', nuptk: u.nuptk || '', email: u.email || '' });
      })
      .catch(() => {
        if (user) {
          setProfile({ name: user.name || '', subject: user.subject || '', nuptk: user.nuptk || '', email: user.email || '' });
        }
      });
  }, [token]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        showAlert('Profil Anda telah berhasil diperbarui dan disimpan!', 'Berhasil Simpan', 'success');
        await update({ name: profile.name, subject: profile.subject, nuptk: profile.nuptk, email: profile.email });
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
        showAlert('Password Anda telah berhasil diubah!', 'Berhasil', 'success');
        setPasswords({ old_password: '', new_password: '', new_password_confirmation: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mengubah password' });
        showAlert(data.message || 'Gagal mengubah password Anda.', 'Gagal', 'error');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan' });
      showAlert('Terjadi kesalahan jaringan saat mengubah password.', 'Kesalahan Koneksi', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center text-gray-600">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h1>
          <p className="text-gray-500">Kelola informasi profil dan keamanan Anda</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: ''}); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-blue-50 text-primary-blue' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" /> Profil Dasar
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

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Informasi Pribadi</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" required
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi / Mata Pelajaran</label>
                <input 
                  type="text" 
                  value={profile.subject}
                  onChange={e => setProfile({...profile, subject: e.target.value})}
                  placeholder="Misal: Guru Matematika"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Mata pelajaran utama yang Anda ampu.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" required
                  value={profile.email}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NUPTK</label>
                <input 
                  type="text" 
                  value={profile.nuptk}
                  onChange={e => setProfile({...profile, nuptk: e.target.value})}
                  placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan"
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
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4">
                <p className="text-sm text-blue-700 font-medium">
                  Jika Anda mendaftar melalui Google dan belum pernah membuat password, kosongkan "Password Saat Ini".
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
                <input 
                  type="password"
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
