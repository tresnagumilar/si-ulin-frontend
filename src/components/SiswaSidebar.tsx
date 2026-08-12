'use client';

import { Home, BookOpen, FileText, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import LogoutButton from '@/components/LogoutButton';
import NotificationBadge from '@/components/NotificationBadge';

export default function SiswaSidebar() {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isPinned || isHovered;

  const menu = [
    { label: 'Beranda', icon: Home, href: '/dashboard/siswa' },
    { label: 'Ujian Saya', icon: BookOpen, href: '/dashboard/siswa/ujian' },
    { label: 'Laporan Nilai', icon: FileText, href: '/dashboard/siswa/nilai' },
    { label: 'Profil Saya', icon: User, href: '/dashboard/siswa/profil' },
  ];

  return (
    <>
      {/* Invisible Hover Trigger Edge */}
      <div 
        className="hidden md:block fixed top-0 left-0 bottom-0 w-4 z-40 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
      />

      {/* Desktop Sidebar */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 py-6 px-3 shrink-0 transition-all duration-300 ease-in-out z-30 ${isExpanded ? 'w-64 shadow-xl' : 'w-20'}`}
      >
        <div className="flex items-center justify-between mb-8 px-2 overflow-hidden">
          <div className="text-lg font-bold text-primary-blue-dark flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-smkn9.png" alt="Logo SMKN 9" className="w-8 h-8 object-contain shrink-0" />
            {isExpanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="whitespace-nowrap font-bold text-primary-blue-dark leading-tight text-base">SI ULIN</span>
                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Sistem Ujian Online</span>
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
        <nav className="space-y-2 flex-1">
          {menu.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/siswa' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3.5 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-primary-blue shadow-sm font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0 mr-3" />
                {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-gray-100">
          <LogoutButton 
            className="flex items-center px-3 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors w-full"
            iconClassName="w-5 h-5 shrink-0 mr-3"
            showText={isExpanded}
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
