'use client';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function MenungguPersetujuanPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      const token = user.token;

      const checkStatus = async () => {
        try {
          const res = await fetch(`${API_URL}/api/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (res.status === 401) {
            // User was deleted/rejected
            alert('Mohon maaf, akun Anda ditolak oleh Admin. Silakan coba mendaftar lagi.');
            signOut({ callbackUrl: '/' });
          } else if (res.ok) {
            const data = await res.json();
            if (data.is_approved) {
              // User was approved
              await update({ is_approved: true });
              router.push('/');
            }
          }
        } catch (error) {
          console.error(error);
        }
      };

      const interval = setInterval(checkStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [status, session, update, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-primary-blue p-8 flex justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full mix-blend-screen filter blur-xl transform translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full mix-blend-screen filter blur-xl transform -translate-x-8 translate-y-8" />
          
          <div className="relative z-10 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <Clock className="w-12 h-12 text-white animate-pulse" />
          </div>
        </div>
        
        <div className="p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Pendaftaran Berhasil!</h1>
          
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-primary-blue shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Akun Anda telah tersimpan di sistem kami, namun saat ini <strong className="text-gray-900">sedang menunggu persetujuan dari Admin</strong> sekolah. 
            </p>
          </div>
          
          <p className="text-sm text-gray-500">
            Silakan hubungi Administrator atau tunggu beberapa saat hingga akun Anda diaktifkan agar bisa digunakan untuk masuk ke dalam aplikasi.
          </p>
          
          <div className="pt-4">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Halaman Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
