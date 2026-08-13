'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { API_URL } from '@/lib/api';

export default function SingleDeviceGuard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;
    const user = session.user as any;
    
    // Admin is allowed multi-device access
    if (user.role === 'ADMIN') return;
    if (!user.token) return;

    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          }
        });
        if (res.status === 401) {
          // Token has been revoked because account logged in on another device
          signOut({ callbackUrl: '/?error=single_device_conflict' });
        }
      } catch (err) {
        console.error('Session guard error:', err);
      }
    };

    // Check on initial mount and tab focus
    checkSession();

    const interval = setInterval(checkSession, 15000);
    const handleFocus = () => checkSession();

    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [session, status]);

  return null;
}
