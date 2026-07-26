'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Shield, User, GraduationCap, Calendar, Save } from 'lucide-react';

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role || 'SISWA';
  const [nama, setNama] = useState('');
  const [tingkat, setTingkat] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [subKelas, setSubKelas] = useState('');
  const [tglLahir, setTglLahir] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user has no session, push to login
    if (session === null) {
      router.push('/');
    } else if (session?.user?.name && !nama) {
      setNama(session.user.name);
    }
  }, [session, router, nama]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) return;

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.token}`
        },
        body: JSON.stringify({
          name: nama,
          role,
          kelas: role === 'SISWA' ? `${tingkat} ${jurusan} ${subKelas}` : undefined,
          jurusan: role === 'SISWA' ? jurusan : undefined,
          tgl_lahir: tglLahir
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Update session token data
        await update({
          name: data.user.name,
          role: data.user.role,
          is_approved: data.user.is_approved,
          kelas: data.user.kelas,
          jurusan: data.user.jurusan,
          tgl_lahir: data.user.tgl_lahir
        });

        // After updating session, redirect appropriately
        if (!data.user.is_approved && data.user.role !== 'SISWA') {
          router.push('/menunggu-persetujuan');
        } else {
          router.push(data.user.role === 'GURU' ? '/guru' : '/dashboard/siswa');
        }
      } else {
        alert(data.message || 'Terjadi kesalahan saat menyimpan data.');
      }
    } catch (error) {
      console.error(error);
      alert('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-primary-blue p-8 flex flex-col items-center relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full mix-blend-screen filter blur-xl transform translate-x-10 -translate-y-10" />
          <div className="relative z-10 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold relative z-10">Lengkapi Profil</h1>
          <p className="text-blue-100 text-sm mt-1 relative z-10">Mohon lengkapi data diri Anda</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Lahir</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  required
                  value={tglLahir}
                  onChange={e => setTglLahir(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue transition-all outline-none"
                />
              </div>
            </div>

            {role === 'SISWA' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tingkat</label>
                  <select
                    required
                    value={tingkat}
                    onChange={e => setTingkat(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue transition-all outline-none"
                  >
                    <option value="">Tingkat</option>
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jurusan</label>
                  <select
                    required
                    value={jurusan}
                    onChange={e => setJurusan(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue transition-all outline-none"
                  >
                    <option value="">Jurusan</option>
                    <option value="IPA">IPA</option>
                    <option value="IPS">IPS</option>
                    <option value="TKJ">TKJ</option>
                    <option value="RPL">RPL</option>
                    <option value="AKL">AKL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Grup</label>
                  <select
                    required
                    value={subKelas}
                    onChange={e => setSubKelas(e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue transition-all outline-none"
                  >
                    <option value="">Grup</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || (role === 'SISWA' && (!tingkat || !jurusan || !subKelas)) || !tglLahir}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-blue hover:bg-primary-blue-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Simpan & Lanjutkan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
