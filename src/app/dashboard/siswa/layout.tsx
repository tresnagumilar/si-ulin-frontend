import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import NotificationBadge from '@/components/NotificationBadge';
import SiswaSidebar from '@/components/SiswaSidebar';

import { authOptions } from '../../api/auth/[...nextauth]/route';

export default async function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.user) {
    redirect('/'); // Go back to login if no session
  }

  const user = session.user as any;
  const needsOnboarding = user.role !== 'ADMIN' && (!user.tgl_lahir || (user.role === 'SISWA' && (!user.kelas || !user.jurusan)));

  if (needsOnboarding) {
    redirect('/onboarding');
  }

  if (user.role === 'ADMIN') {
    redirect('/admin');
  }

  if (user.role === 'GURU') {
    redirect('/guru');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-0 md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-gray-200 flex justify-between items-center px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 sticky top-0 z-50 shadow-sm">
        <div className="font-bold text-primary-blue-dark flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-smkn9.png" alt="Logo SMKN 9" className="w-6 h-6 object-contain" />
          <span>SI ULIN</span>
        </div>
        <NotificationBadge />
      </div>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Dynamic Sidebar and Bottom Nav */}
      <SiswaSidebar />
    </div>
  );
}
