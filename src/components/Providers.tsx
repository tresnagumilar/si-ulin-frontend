'use client';
import { SessionProvider } from "next-auth/react";
import HeartbeatProvider from "./HeartbeatProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeartbeatProvider>
        {children}
      </HeartbeatProvider>
    </SessionProvider>
  );
}
