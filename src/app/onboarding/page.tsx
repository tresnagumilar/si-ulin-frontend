'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Book, GraduationCap, Calendar, CheckCircle } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    kelas: '10',
    jurusan: 'IPA',
    dob: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/dashboard/siswa');
      } else {
        alert('Gagal menyimpan data.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <CheckCircle className="w-8 h-8 text-primary-blue" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lengkapi Data Diri</h1>
          <p className="text-sm text-gray-500">Silakan isi data Anda untuk melanjutkan ke dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
                placeholder="Misal: Budi Santoso"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kelas</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
                </div>
                <select
                  required
                  value={formData.kelas}
                  onChange={(e) => setFormData({...formData, kelas: e.target.value})}
                  className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all appearance-none"
                >
                  <option value="10">Kelas 10</option>
                  <option value="11">Kelas 11</option>
                  <option value="12">Kelas 12</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jurusan</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Book className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
                </div>
                <select
                  required
                  value={formData.jurusan}
                  onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
                  className="block w-full pl-10 pr-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all appearance-none"
                >
                  <option value="IPA">IPA</option>
                  <option value="IPS">IPS</option>
                  <option value="BAHASA">Bahasa</option>
                  <option value="TKJ">TKJ</option>
                  <option value="RPL">RPL</option>
                  <option value="MM">Multimedia</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal Lahir</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
              </div>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-blue/20 text-sm font-bold text-white bg-primary-blue hover:bg-primary-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-8"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Simpan & Lanjutkan'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
