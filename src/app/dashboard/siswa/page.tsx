import { Bell, Coins, Calendar, ArrowRight, Clock, CheckCircle2, ChevronRight, Calculator, Dna, FileText } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PerformanceChart from '@/components/PerformanceChart';

export default async function SiswaDashboard() {
  const subjects = ['Semua', 'Matematika', 'B. Indonesia', 'Fisika', 'Biologi'];
  
  const session = await getServerSession();
  if (!session || !session.user?.email) redirect('/');

  const student = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      examAttempts: {
        where: { finishedAt: { not: null } },
        orderBy: { finishedAt: 'asc' },
        include: { exam: true },
      }
    }
  });

  if (!student) redirect('/onboarding');

  const firstName = student.name.split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();

  // Fetch Live Exams (excluding already attempted)
  const attemptedExamIds = student.examAttempts.map(a => a.examId);
  const liveExams = await prisma.exam.findMany({
    where: {
      isLive: true,
      id: { notIn: attemptedExamIds }
    },
    take: 3
  });

  // Upcoming Exams
  const now = new Date();
  const upcomingExams = await prisma.exam.findMany({
    where: {
      isLive: false,
      startTime: { gt: now }
    },
    orderBy: { startTime: 'asc' },
    take: 1
  });

  // Prepare chart data
  const chartData = student.examAttempts.map(attempt => ({
    name: attempt.exam.subject.substring(0, 3).toUpperCase(),
    score: attempt.score || 0
  }));

  const upcomingExam = upcomingExams[0];

  return (
    <div className="flex flex-col w-full h-full">
      {/* Top Header Section with Blue Gradient */}
      <div className="bg-gradient-to-br from-primary-blue-dark via-primary-blue to-primary-blue-light pt-12 pb-24 px-6 rounded-b-[2.5rem] relative shadow-lg">
        {/* Subtle background patterns */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 overflow-hidden flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold uppercase">{initial}</div>
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-primary-blue-dark rounded-full" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">Selamat Pagi ⭐</p>
              <h2 className="text-white text-xl font-bold">Hai, {firstName}!</h2>
              <p className="text-white/60 text-xs mt-0.5">{student.kelas} {student.jurusan}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Coins className="w-4 h-4 text-accent-yellow" />
              <span className="text-white text-xs font-bold">0</span>
            </div>
            <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10 relative">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="mt-8 overflow-x-auto hide-scrollbar relative z-10 flex gap-3 pb-2 -mx-2 px-2">
          {subjects.map((sub, i) => (
            <button
              key={sub}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                i === 0
                  ? 'bg-white text-primary-blue-dark shadow-md'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-5 -mt-16 relative z-20 space-y-6 pb-8">
        
        {/* Upcoming Exam Card */}
        {upcomingExam && (
          <div className="bg-primary-blue-dark rounded-3xl p-6 shadow-xl relative overflow-hidden text-white border border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue-light/50 rounded-full mix-blend-screen filter blur-3xl transform translate-x-10 -translate-y-10" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/10">
                <Calendar className="w-4 h-4 text-accent-yellow" />
                <span className="text-xs font-semibold">Ujian Mendatang</span>
              </div>
              <div className="bg-accent-yellow text-primary-blue-dark px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-accent-yellow/20 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Segera Hadir
              </div>
            </div>
            
            <div className="relative z-10 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
                <Calculator className="w-6 h-6 text-blue-200" />
              </div>
              <h3 className="text-2xl font-bold leading-tight mb-2">{upcomingExam.title}</h3>
              <div className="flex items-center text-white/70 text-xs gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Mulai: {upcomingExam.startTime?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Active Exams Section */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary-blue" />
              Ujian Aktif
            </h3>
            <Link href="/dashboard/siswa/ujian" className="text-xs font-semibold text-primary-blue hover:text-primary-blue-dark flex items-center">
              Lihat Semua <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {liveExams.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Tidak ada ujian aktif</h4>
                <p className="text-xs text-gray-500">Saat ini belum ada ujian yang bisa Anda kerjakan.</p>
              </div>
            ) : (
              liveExams.map(exam => (
                <div key={exam.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary-blue flex items-center justify-center shrink-0 border border-blue-100">
                      <Calculator className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-primary-blue tracking-wider uppercase">{exam.subject}</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                          LIVE
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 leading-tight">{exam.title}</h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1 pt-4 border-t border-gray-50">
                    <div className="flex gap-4">
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {exam.durationMin} menit
                      </span>
                    </div>
                    <Link href={`/ujian/${exam.id}`} className="bg-primary-blue hover:bg-primary-blue-light text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-primary-blue/20 flex items-center gap-1.5 transition-all active:scale-95">
                      Masuk <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Performance Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-blue" />
              Performa Saya
            </h3>
            <Link href="/dashboard/siswa/nilai" className="text-xs font-semibold text-primary-blue hover:text-primary-blue-dark flex items-center">
              Laporan <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <PerformanceChart data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
}
