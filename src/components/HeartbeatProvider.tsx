'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function HeartbeatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;
    
    const token = (session.user as any).token;
    
    const sendHeartbeat = async () => {
      try {
        await fetch('http://localhost:8000/api/heartbeat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
      } catch (error) {
        // Ignore network errors for heartbeat
      }
    };

    // Send immediately on mount
    sendHeartbeat();

    // Send every 60 seconds
    const intervalId = setInterval(sendHeartbeat, 60000);

    return () => clearInterval(intervalId);
  }, [session]);

  return <>{children}</>;
}
