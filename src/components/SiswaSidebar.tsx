'use client';

import { Home, BookOpen, FileText, User, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import NotificationBadge from '@/components/NotificationBadge';

export default function SiswaSidebar() {
  const pathname = usePathname();

  const menu = [
    { label: 'Beranda', icon: Home, href: '/dashboard/siswa' },
    { label: 'Ujian Saya', icon: BookOpen, href: '/dashboard/siswa/ujian' },
    { label: 'Laporan Nilai', icon: FileText, href: '/dashboard/siswa/nilai' },
    { label: 'Profil Saya', icon: User, href: '/dashboard/siswa/profil' },
    { label: 'Bantuan', icon: HelpCircle, href: '/dashboard/siswa/bantuan' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col py-6 px-4 shrink-0">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="text-xl font-bold text-primary-blue-dark flex items-center">
            <div className="w-8 h-8 bg-accent-yellow rounded-lg mr-3 flex items-center justify-center text-white font-bold shadow-sm">S</div>
            Smart Exam
          </div>
          <NotificationBadge />
        </div>
        <nav className="space-y-2 flex-1">
          {menu.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/siswa' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-primary-blue shadow-sm font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-gray-100">
          <LogoutButton 
            className="flex items-center px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors w-full"
            iconClassName="w-5 h-5 mr-3"
            textClassName=""
          />
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-50 px-2 shadow-lg">
        {menu.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard/siswa' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                isActive ? 'text-primary-blue font-bold' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
        <LogoutButton 
          className="flex flex-col items-center py-1 px-2 text-gray-400 hover:text-red-500 transition-colors"
          iconClassName="w-5 h-5 mb-1"
          showText={false}
        />
      </div>
    </>
  );
}
