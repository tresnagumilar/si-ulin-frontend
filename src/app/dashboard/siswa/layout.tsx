import { Home, BookOpen, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session || !session.user?.email) {
    redirect('/'); // Go back to login if no session
  }

  // Check if user exists in database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/onboarding'); // Force onboarding if missing data
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0 md:flex-row">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 px-4">
        <Link href="/dashboard/siswa" className="flex flex-col items-center text-primary-blue">
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Beranda</span>
        </Link>
        <Link href="/dashboard/siswa/ujian" className="flex flex-col items-center text-gray-400 hover:text-primary-blue transition-colors relative">
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          <BookOpen className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Ujian</span>
        </Link>
        <Link href="/dashboard/siswa/nilai" className="flex flex-col items-center text-gray-400 hover:text-primary-blue transition-colors">
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Nilai</span>
        </Link>
        <Link href="/dashboard/siswa/profil" className="flex flex-col items-center text-gray-400 hover:text-primary-blue transition-colors">
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-semibold">Profil</span>
        </Link>
      </div>

      {/* Desktop Sidebar placeholder (if needed) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col py-6 px-4 shrink-0">
        <div className="text-xl font-bold text-primary-blue-dark mb-8 flex items-center">
          <div className="w-8 h-8 bg-accent-yellow rounded-lg mr-3 flex items-center justify-center text-white font-bold">S</div>
          Smart Exam
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard/siswa" className="flex items-center px-4 py-3 bg-blue-50 text-primary-blue rounded-xl font-medium">
            <Home className="w-5 h-5 mr-3" /> Beranda
          </Link>
          <Link href="/dashboard/siswa/ujian" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <BookOpen className="w-5 h-5 mr-3" /> Ujian Saya
          </Link>
          <Link href="/dashboard/siswa/nilai" className="flex items-center px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-medium transition-colors">
            <FileText className="w-5 h-5 mr-3" /> Laporan Nilai
          </Link>
        </nav>
      </aside>
    </div>
  );
}
