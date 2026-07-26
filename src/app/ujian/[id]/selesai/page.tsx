'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UjianSelesaiPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      router.push('/dashboard/siswa/nilai');
    }
  }, [countdown, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center border border-gray-100 animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">Terima Kasih!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Anda telah berhasil menyelesaikan dan mengumpulkan ujian ini. Jawaban Anda telah tersimpan dengan aman di sistem.
        </p>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8">
          <p className="text-sm font-medium text-blue-800">
            Mengarahkan ke halaman nilai dalam <span className="font-bold text-lg">{countdown}</span> detik...
          </p>
        </div>

        <button
          onClick={() => router.push('/dashboard/siswa/nilai')}
          className="w-full bg-primary-blue hover:bg-primary-blue-dark text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          Lihat Nilai Saya Sekarang <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
