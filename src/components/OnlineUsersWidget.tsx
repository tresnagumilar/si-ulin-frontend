'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, ChevronDown, ChevronUp, User } from 'lucide-react';

export default function OnlineUsersWidget() {
  const { data: session } = useSession();
  const [onlineUsers, setOnlineUsers] = useState<{ ADMIN: any[], GURU: any[], SISWA: any[] }>({ ADMIN: [], GURU: [], SISWA: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    const token = (session.user as any).token;

    const fetchOnlineUsers = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/online-users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOnlineUsers(data);
        }
      } catch (err) {
        console.error('Failed to fetch online users', err);
      }
      setLoading(false);
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const totalOnline = (onlineUsers.ADMIN?.length || 0) + (onlineUsers.GURU?.length || 0) + (onlineUsers.SISWA?.length || 0);

  if (loading) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-64">
      {/* Widget Header (Always visible) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-200 rounded-t-xl md:rounded-xl shadow-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="font-bold text-gray-800 text-sm">Online Users ({totalOnline})</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
      </div>

      {/* Widget Body (Collapsible) */}
      {isOpen && (
        <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-lg overflow-hidden flex flex-col mt-[-1px] max-h-80 relative z-40">
          <div className="overflow-y-auto p-3 space-y-4">
            
            {/* ADMIN Section */}
            {onlineUsers.ADMIN && onlineUsers.ADMIN.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Admin</h4>
                <ul className="space-y-2">
                  {onlineUsers.ADMIN.map(u => (
                    <li key={u.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="truncate">{u.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* GURU Section */}
            {onlineUsers.GURU && onlineUsers.GURU.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Guru</h4>
                <ul className="space-y-2">
                  {onlineUsers.GURU.map(u => (
                    <li key={u.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="truncate">{u.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SISWA Section */}
            {onlineUsers.SISWA && onlineUsers.SISWA.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Siswa</h4>
                <ul className="space-y-2">
                  {onlineUsers.SISWA.map(u => (
                    <li key={u.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="truncate">{u.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {totalOnline === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Tidak ada yang online selain Anda.</p>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
