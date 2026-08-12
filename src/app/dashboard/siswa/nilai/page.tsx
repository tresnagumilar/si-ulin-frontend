import { FileText, TrendingUp } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import ChatButton from './ChatButton';

export default async function LaporanNilaiPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/');

  const res = await fetch('http://127.0.0.1:8000/api/student/dashboard', {
    headers: {
      'Authorization': `Bearer ${session.user.token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) redirect('/onboarding');
  
  const data = await res.json();
  const attempts: any[] = data.attempts ? [...data.attempts].reverse() : [];
  const totalExams = attempts.length;
  
  let averageScore = 0;

  if (totalExams > 0) {
    const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
    averageScore = totalScore / totalExams;
  }

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan Nilai</h1>
        <p className="text-gray-500">Evaluasi performa ujian dan hasil belajar Anda.</p>
      </div>

      {/* Summary Cards (Simplified) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-primary-blue rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalExams}</p>
            <p className="text-xs text-gray-500 font-medium">Ujian Selesai</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{averageScore.toFixed(1)}</p>
            <p className="text-xs text-gray-500 font-medium">Rata-rata Nilai</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-800">Riwayat Ujian Terbaru</h2>
        </div>
        
        {attempts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <FileText className="w-8 h-8 text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-700 mb-1">Belum ada nilai</h3>
             <p className="text-gray-500 text-sm">Anda belum menyelesaikan ujian apapun.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {attempts.map((attempt, idx) => {
              const isPassed = (attempt.score || 0) >= (attempt.exam?.passingScore || 70);
              return (
                <div key={attempt.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/80 transition-all duration-300">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 uppercase">{attempt.exam.subject}</span>
                      <span className="text-xs text-gray-400">
                        {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{attempt.exam.title}</h3>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end mt-4 sm:mt-0">
                    <ChatButton attemptId={attempt.id} examTitle={attempt.exam.title} />
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${isPassed ? 'text-primary-blue-dark' : 'text-red-500'}`}>
                        {attempt.score}
                      </p>
                      <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${isPassed ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-500 bg-red-50 border-red-100'}`}>
                        {isPassed ? 'LULUS' : 'REMEDIAL'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
