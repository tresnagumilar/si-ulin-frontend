import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Users, FileText, Activity } from 'lucide-react';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function GuruDashboardPage() {
  const session = (await getServerSession(authOptions)) as any;
  
  if (!session || !session.user) redirect('/');
  if (session.user.role !== 'GURU') redirect('/dashboard/siswa');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dasbor Guru</h1>
        <p className="text-gray-500">Kelola soal ujian dan evaluasi hasil belajar siswa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Akses Kelola Ujian</p>
            <p className="text-xl font-bold text-gray-900">Tersedia</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Pembuatan Soal</p>
            <p className="text-xl font-bold text-gray-900">Aktif</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Selamat Datang, {session.user.name}</h2>
        <p className="text-gray-600">Gunakan menu <strong>Kelola Ujian</strong> di samping untuk membuat ujian baru, menambah butir soal manual, atau mempublikasikan (LIVE) ujian kepada para siswa.</p>
      </div>
    </div>
  );
}
