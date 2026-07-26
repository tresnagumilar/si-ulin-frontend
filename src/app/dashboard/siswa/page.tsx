import { Bell, Coins, Calendar, ArrowRight, Clock, CheckCircle2, ChevronRight, Calculator, Dna, FileText } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import PerformanceChart from '@/components/PerformanceChart';
import OnlineUsersWidget from '@/components/OnlineUsersWidget';
import CategoryFilterExams from './CategoryFilterExams';
import { authOptions } from '../../api/auth/[...nextauth]/route';

export default async function SiswaDashboard() {
  const subjects = ['Semua', 'Matematika', 'B. Indonesia', 'Fisika', 'Biologi'];
  
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
  const student = data.user;
  const liveExams = data.liveExams || [];
  const upcomingExam = data.upcomingExam;
  const attempts = data.attempts || [];

  const firstName = student.name.split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();

  // Prepare chart data
  const chartData = attempts.map((attempt: any) => ({
    name: attempt.exam.subject.substring(0, 3).toUpperCase(),
    score: attempt.score || 0
  }));

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
              {student.kelas ? (
                <p className="text-white/60 text-xs mt-0.5">{student.kelas} {student.jurusan}</p>
              ) : (
                <p className="text-red-300 font-bold text-[10px] mt-0.5 bg-red-900/40 px-2 py-0.5 rounded-full inline-block border border-red-500/30">Belum Pilih Kelas</p>
              )}
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
                <span>Mulai: {upcomingExam.startTime ? new Date(upcomingExam.startTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Categories & Active Exams Filter Component */}
        <CategoryFilterExams subjects={subjects} liveExams={liveExams} />

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
      
      <OnlineUsersWidget />
    </div>
  );
}
