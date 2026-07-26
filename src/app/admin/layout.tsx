'use client';
import { LayoutDashboard, LogOut, FileText, Users, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LogoutButton from '@/components/LogoutButton';
import NotificationBadge from '@/components/TicketNotificationBadge';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      if (user.role !== 'ADMIN') {
        router.push('/');
      }
    }
  }, [status, session, router]);

  const menu = [
    { label: 'Dasbor', icon: LayoutDashboard, href: '/admin' },
    { label: 'Data Pengguna', icon: Users, href: '/admin/siswa' },
    { label: 'Data Ujian', icon: FileText, href: '/admin/ujian' },
    { label: 'Laporan Pengguna', icon: HelpCircle, href: '/admin/laporan' },
    { label: 'Pengaturan', icon: Settings, href: '/admin/pengaturan' },
  ];

  if (status === 'loading' || !session || (session.user as any).role !== 'ADMIN') {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50">Memuat...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary-blue rounded-lg flex items-center justify-center mr-3">
            <div className="w-4 h-4 border-2 border-white rounded-sm" />
          </div>
          <span className="font-bold text-lg text-primary-blue-dark flex-1">Admin Panel</span>
          <NotificationBadge />
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu Utama</p>
          {menu.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-blue text-white shadow-md shadow-primary-blue/20 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <LogoutButton 
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 font-semibold hover:bg-red-50 transition-colors"
            iconClassName="w-5 h-5"
            textClassName=""
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 sticky top-0 z-50">
           <span className="font-bold text-primary-blue-dark">Admin Panel</span>
           <div className="flex items-center gap-2">
             <NotificationBadge />
             <LogoutButton 
               className="p-2 text-gray-500 hover:text-red-500 transition-colors"
               iconClassName="w-5 h-5"
               showText={false}
             />
           </div>
        </div>
        
        {children}
      </main>
      
    </div>
  );
}
