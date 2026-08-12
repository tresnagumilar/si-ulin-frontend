'use client';
import { LayoutDashboard, LogOut, FileText, Settings, Users, Database, HelpCircle, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LogoutButton from '@/components/LogoutButton';
import NotificationBadge from '@/components/NotificationBadge';

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      const needsOnboarding = user.role !== 'ADMIN' && (!user.tgl_lahir || (user.role === 'SISWA' && (!user.kelas || !user.jurusan)));
      
      if (needsOnboarding) {
        router.push('/onboarding');
      } else if (!user.is_approved) {
        router.push('/menunggu-persetujuan');
      }
    }
  }, [status, session, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  const menu = [
    { label: 'Dasbor', icon: LayoutDashboard, href: '/guru' },
    { label: 'Ujian Siswa', icon: FileText, href: '/guru/ujian' },
    { label: 'Bank Soal', icon: Database, href: '/guru/bank-soal' },
    { label: 'Data Siswa', icon: Users, href: '/guru/siswa' },
    { label: 'Pengaturan', icon: Settings, href: '/guru/pengaturan' },
  ];

  if (status === 'loading' || !session) {
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
                <span className="font-bold text-base text-green-700 whitespace-nowrap leading-tight">SI ULIN</span>
                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Sistem Ujian Online (Guru)</span>
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
            const isActive = pathname === item.href || (item.href !== '/guru' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all ${isActive ? 'bg-green-600 text-white shadow-md shadow-green-500/20 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
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

      {/* Mobile Drawer Sidebar & Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          
          <aside className="relative w-72 bg-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-smkn9.png" alt="Logo SMKN 9" className="w-8 h-8 object-contain mr-3" />
                <span className="font-bold text-lg text-green-700">Panel Guru</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu Utama</p>
              {menu.map(item => {
                const isActive = pathname === item.href || (item.href !== '/guru' && pathname.startsWith(item.href));
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-green-600 text-white shadow-md shadow-green-500/20 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
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
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 sticky top-0 z-40 shadow-sm">
           <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
               aria-label="Buka Menu"
             >
               <Menu className="w-6 h-6" />
             </button>
             <span className="font-bold text-green-700 text-base">Panel Guru</span>
           </div>
           
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
