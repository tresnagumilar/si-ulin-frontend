'use client';

import dynamic from 'next/dynamic';

const LoginPageClient = dynamic(() => import('./LoginPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-primary-blue flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

export default function Page() {
  return <LoginPageClient />;
}
