'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, BookOpen, CheckCircle2, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  examId?: string;
}

export default function NotificationBadge() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user) return;
    const token = (session.user as any).token;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-primary-blue transition-colors rounded-full hover:bg-gray-100 outline-none"
        title={unreadCount > 0 ? `${unreadCount} notifikasi baru` : "Tidak ada notifikasi baru"}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary-blue" />
              Notifikasi {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{unreadCount} baru</span>}
            </h4>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-gray-300" />
                Tidak ada notifikasi aktif saat ini.
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-4 hover:bg-gray-50/80 transition-colors flex gap-3 items-start">
                  {notif.type === 'token_warning' ? (
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-blue-50 text-primary-blue border border-blue-200 shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 text-xs">
                    <p className="font-bold text-gray-900 mb-0.5">{notif.title}</p>
                    <p className="text-gray-600 leading-relaxed">{notif.message}</p>
                    {notif.examId && (
                      <Link 
                        href={session?.user?.role === 'GURU' ? `/guru/ujian` : `/ujian/${notif.examId}`}
                        onClick={() => setIsOpen(false)}
                        className="mt-2 inline-flex items-center text-[11px] font-bold text-primary-blue hover:underline"
                      >
                        Buka Ujian &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
