import { BookOpen, CheckCircle2, Clock, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../api/auth/[...nextauth]/route';

export default async function UjianSayaPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/');

  const res = await fetch('http://127.0.0.1:8000/api/student/exams', {
    headers: {
      'Authorization': `Bearer ${session.user.token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) redirect('/onboarding');
  
  const data = await res.json();
  const liveExams: any[] = data.liveExams || [];
  const upcomingExams: any[] = data.upcomingExams || [];

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ujian Saya</h1>
        <p className="text-gray-500">Kelola dan lihat semua jadwal ujian Anda di sini.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border border-gray-200 bg-white rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all"
            placeholder="Cari ujian (misal: Matematika)"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shrink-0">
          <Filter className="h-5 w-5" /> Filter
        </button>
      </div>

      {/* Exam Lists */}
      <div className="space-y-8">
        
        {/* Section: Sedang Berlangsung */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-bold text-gray-800">Sedang Berlangsung</h2>
          </div>
          
          {liveExams.length === 0 ? (
             <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500 text-sm border border-dashed border-gray-300">
               Tidak ada ujian yang sedang berlangsung saat ini.
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveExams.map(exam => (
                <div key={exam.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-primary-blue bg-blue-50 px-2 py-1 rounded-md uppercase">{exam.subject}</span>
                    {exam.isRemedial ? (
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">REMEDIAL</span>
                    ) : (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full animate-pulse border border-red-100">LIVE</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{exam.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
                    <Clock className="w-4 h-4" /> {exam.durationMin} Menit • {exam.totalQuestions} Soal
                  </div>
                  <Link href={`/ujian/${exam.id}`} className="block w-full text-center bg-primary-blue hover:bg-primary-blue-dark text-white py-2.5 rounded-xl font-bold transition-colors">
                    Masuk Ujian
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Ujian Mendatang */}
        <section>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-800">Ujian Mendatang</h2>
          </div>
          
          {upcomingExams.length === 0 ? (
             <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500 text-sm border border-dashed border-gray-300">
               Belum ada jadwal ujian mendatang.
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingExams.map(exam => (
                <div key={exam.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 opacity-80">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase">{exam.subject}</span>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {exam.startTime ? new Date(exam.startTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : '-'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{exam.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 gap-2">
                    <Clock className="w-4 h-4" /> {exam.durationMin} Menit • {exam.totalQuestions} Soal
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
      </div>
    </div>
  );
}
