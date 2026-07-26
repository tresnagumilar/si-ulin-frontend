'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Calendar, Save, CheckCircle2, AlertCircle, Lock, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilSiswaPage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [tglLahir, setTglLahir] = useState('');
  const [email, setEmail] = useState('');
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');

  // Password State
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', new_password_confirmation: '' });

  useEffect(() => {
    if (!session?.user?.token) return;

    // Fetch latest user profile from backend
    fetch('http://localhost:8000/api/me', {
      headers: {
        'Authorization': `Bearer ${(session.user as any).token}`
      }
    })
      .then(res => res.json())
      .then(user => {
        if (user.name) setNama(user.name);
        if (user.kelas) setKelas(user.kelas);
        if (user.jurusan) setJurusan(user.jurusan);
        if (user.tgl_lahir) setTglLahir(user.tgl_lahir);
        if (user.email) setEmail(user.email);
        if (user.nis) setNis(user.nis);
        if (user.nisn) setNisn(user.nisn);
      })
      .catch(() => {
        const user = session.user as any;
        if (user.name) setNama(user.name);
        if (user.kelas) setKelas(user.kelas);
        if (user.jurusan) setJurusan(user.jurusan);
        if (user.tgl_lahir) setTglLahir(user.tgl_lahir);
        if (user.email) setEmail(user.email);
        if (user.nis) setNis(user.nis);
        if (user.nisn) setNisn(user.nisn);
      });
  }, [session?.user?.token]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    if (!session?.user?.token) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session.user as any).token}`
        },
        body: JSON.stringify({
          name: nama,
          tgl_lahir: tglLahir,
          email: email,
          nis: nis,
          nisn: nisn
        })
      });

      const data = await res.json();
      if (res.ok) {
        await update({
          name: data.user.name,
          tgl_lahir: data.user.tgl_lahir,
          email: data.user.email,
          nis: data.user.nis,
          nisn: data.user.nisn
        });
        setSuccessMsg('Profil berhasil diperbarui!');
      } else {
        setErrorMsg(data.message || 'Gagal menyimpan profil.');
      }
    } catch (error) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (passwords.new_password !== passwords.new_password_confirmation) {
      setErrorMsg('Konfirmasi password baru tidak cocok!');
      return;
    }

    if (!session?.user?.token) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session.user as any).token}`
        },
        body: JSON.stringify(passwords)
      });
      
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Password berhasil diubah!');
        setPasswords({ old_password: '', new_password: '', new_password_confirmation: '' });
      } else {
        setErrorMsg(data.message || 'Gagal mengubah password');
      }
    } catch (error) {
      setErrorMsg('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return null;

  return (
    <div className="flex flex-col w-full h-full p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi data diri Anda di sini.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
          <button
            onClick={() => { setActiveTab('profile'); setSuccessMsg(''); setErrorMsg(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-blue-50 text-primary-blue' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" /> Profil Dasar
          </button>
          <button
            onClick={() => { setActiveTab('password'); setSuccessMsg(''); setErrorMsg(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'password' ? 'bg-blue-50 text-primary-blue' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Lock className="w-5 h-5" /> Keamanan Sandi
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-md text-primary-blue">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{session?.user?.name}</h2>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold border border-green-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Siswa Aktif
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text" required
                      value={nama}
                      onChange={e => setNama(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <input
                      type="email" required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">NIS (Nomor Induk Siswa)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nis}
                      onChange={e => setNis(e.target.value)}
                      placeholder="Masukkan NIS untuk Login"
                      className="block w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">NISN (Nomor Induk Siswa Nasional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nisn}
                      onChange={e => setNisn(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date" required
                      value={tglLahir}
                      onChange={e => setTglLahir(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Kelas</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    {kelas ? (
                      <input
                        type="text"
                        disabled
                        value={kelas}
                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium sm:text-sm"
                      />
                    ) : (
                      <div className="block w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold sm:text-sm flex items-center">
                        Belum Pilih Kelas
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Hubungi Admin untuk {kelas ? "mengubah" : "mengisi"} kelas.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Jurusan</label>
                  <input
                    type="text" disabled
                    value={jurusan}
                    className="block w-full px-4 py-3 border border-gray-200 bg-gray-100 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-gray-100">
                <button
                  type="submit" disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-blue hover:bg-primary-blue-dark text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
             <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4">
                <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> 
                  Jika Anda mendaftar melalui Google dan belum pernah membuat password, kosongkan "Password Saat Ini".
                </p>
              </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
               <input 
                 type="password"
                 value={passwords.old_password}
                 onChange={e => setPasswords({...passwords, old_password: e.target.value})}
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
               />
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
               <input 
                 type="password" required minLength={6}
                 value={passwords.new_password}
                 onChange={e => setPasswords({...passwords, new_password: e.target.value})}
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
               <input 
                 type="password" required minLength={6}
                 value={passwords.new_password_confirmation}
                 onChange={e => setPasswords({...passwords, new_password_confirmation: e.target.value})}
                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
               />
             </div>

             <div className="pt-4 flex justify-end border-t border-gray-100">
               <button
                 type="submit" disabled={loading}
                 className="flex items-center gap-2 px-6 py-3 bg-primary-blue hover:bg-primary-blue-dark text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
               >
                 {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                 Ubah Password
               </button>
             </div>
           </form>
          )}

        </div>
      </div>
    </div>
  );
}
