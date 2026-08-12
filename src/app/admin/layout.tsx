'use client';
import { LayoutDashboard, LogOut, FileText, Users, Settings, BookOpen, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import LogoutButton from '@/components/LogoutButton';
import NotificationBadge from '@/components/TicketNotificationBadge';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

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
    { label: 'Pengaturan Akademik', icon: BookOpen, href: '/admin/akademik' },
    { label: 'Pengaturan', icon: Settings, href: '/admin/pengaturan' },
  ];

  if (status === 'loading' || !session || (session.user as any).role !== 'ADMIN') {
    return <div className="h-screen w-full flex items-center justify-center bg-gray-50">Memuat...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900 font-sans relative">
      
      {/* Invisible Hover Trigger Edge */}
      <div 
        className="hidden md:block fixed top-0 left-0 bottom-0 w-4 z-40 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
      />

      {/* Desktop Sidebar (Left side, Auto-Hide/Hover/Expand) */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 shrink-0 transition-all duration-300 ease-in-out z-30 ${isExpanded ? 'w-64 shadow-xl' : 'w-20'}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-smkn9.png" alt="Logo SMKN 9" className="w-8 h-8 object-contain shrink-0" />
            {isExpanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-base text-primary-blue-dark whitespace-nowrap leading-tight">SI ULIN</span>
                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Sistem Ujian Online (Admin)</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title={isPinned ? 'Kunci Sidebar' : 'Buka Kunci Sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {isExpanded && <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu Utama</p>}
          {menu.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${isActive ? 'bg-primary-blue text-white shadow-md shadow-primary-blue/20 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <LogoutButton 
            className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-red-500 font-semibold hover:bg-red-50 transition-colors"
            iconClassName="w-5 h-5 shrink-0"
            showText={isExpanded}
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
