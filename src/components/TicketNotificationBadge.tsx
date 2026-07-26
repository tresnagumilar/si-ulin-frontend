'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function TicketNotificationBadge() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;
    const token = (session.user as any).token;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/ticket-notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (unreadCount === 0) {
    return (
      <div className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" title="Tidak ada laporan baru">
        <Bell className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="relative p-2 text-primary-blue hover:text-primary-blue-dark transition-colors cursor-pointer" title={`${unreadCount} tanggapan laporan belum dibaca`}>
      <Bell className="w-5 h-5" />
      <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full animate-bounce">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </div>
  );
}
