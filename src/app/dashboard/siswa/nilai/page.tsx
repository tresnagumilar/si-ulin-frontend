import { FileText, Download, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LaporanNilaiPage() {
  const session = await getServerSession();
  if (!session || !session.user?.email) redirect('/');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      examAttempts: {
        where: { finishedAt: { not: null } },
        include: { exam: true },
        orderBy: { finishedAt: 'desc' }
      }
    }
  });

  if (!user) redirect('/onboarding');

  const attempts = user.examAttempts;
  const totalExams = attempts.length;
  
  let averageScore = 0;
  let passedExams = 0;

  if (totalExams > 0) {
    const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
    averageScore = totalScore / totalExams;
    passedExams = attempts.filter(a => (a.score || 0) >= 70).length; // assume passing score is 70
  }

  const passRate = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;

  return (
    <div className="flex flex-col w-full h-full p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan Nilai</h1>
          <p className="text-gray-500">Evaluasi performa ujian dan perkembangan belajar Anda.</p>
        </div>
        <button className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 text-primary-blue px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" /> Ekspor PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-blue-50 text-primary-blue rounded-full flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{totalExams}</p>
          <p className="text-xs text-gray-500 font-medium">Ujian Selesai</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{averageScore.toFixed(1)}</p>
          <p className="text-xs text-gray-500 font-medium">Rata-rata Nilai</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center opacity-50">
          <div className="w-10 h-10 bg-yellow-50 text-accent-yellow-hover rounded-full flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">-</p>
          <p className="text-xs text-gray-500 font-medium">Peringkat Kelas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
            <BarChart3 className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">{passRate.toFixed(0)}%</p>
          <p className="text-xs text-gray-500 font-medium">Tingkat Kelulusan</p>
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
            {attempts.map(attempt => {
              const isPassed = (attempt.score || 0) >= 70;
              return (
                <div key={attempt.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 uppercase">{attempt.exam.subject}</span>
                      <span className="text-xs text-gray-400">
                        {attempt.finishedAt?.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{attempt.exam.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
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
