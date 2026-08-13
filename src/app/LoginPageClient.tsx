'use client';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Key, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";

export default function LoginPageClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [role, setRole] = useState<'siswa' | 'guru' | 'admin'>('siswa');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Show error from URL if exists
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const errorMsg = urlParams.get('error');
      if (errorMsg) {
        let displayError = errorMsg;
        if (errorMsg === 'OAuthSignin') {
          displayError = 'Google OAuth belum dikonfigurasi. Pastikan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET sudah diisi pada file .env.local di folder si-ulin-frontend.';
        } else if (errorMsg === 'OAuthCallback') {
          displayError = 'Gagal memproses autentikasi dari Google. Silakan coba lagi.';
        } else if (errorMsg === 'Configuration') {
          displayError = 'Terjadi kesalahan konfigurasi autentikasi pada server.';
        } else if (errorMsg === 'AccessDenied') {
          displayError = 'Akses ditolak. Akun Google Anda tidak memiliki izin untuk masuk.';
        } else if (errorMsg === 'single_device_conflict') {
          displayError = 'Akun ini baru saja masuk di perangkat lain. Sesi Anda pada perangkat ini telah diakhiri.';
        }

        alert(displayError);
        // Clear the URL to prevent showing alert again on reload
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      const needsOnboarding = user.role !== 'ADMIN' && (!user.tgl_lahir || (user.role === 'SISWA' && (!user.kelas || !user.jurusan)));

      if (needsOnboarding) {
        router.push('/onboarding');
      } else if (!user.is_approved && user.role !== 'SISWA') {
        router.push('/menunggu-persetujuan');
      } else {
        if (user.role === 'ADMIN') router.push('/admin');
        else if (user.role === 'GURU') router.push('/guru');
        else router.push('/dashboard/siswa');
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!isLogin) {
      const name = formData.get('name') as string;
      const subject = formData.get('subject') as string;
      try {
        const regRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name, 
            email, 
            password, 
            role: role.toUpperCase(),
            subject: role === 'guru' ? subject : undefined 
          })
        });
        const regData = await regRes.json();
        if (!regRes.ok) {
          setFormError(regData.message || 'Gagal mendaftar');
          setLoading(false);
          return;
        }
        
        // Auto sign-in after successful registration
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password
        });

        if ((result as any)?.error) {
          setFormError('Pendaftaran berhasil. Silakan masuk menggunakan akun baru Anda.');
          setIsLogin(true);
        }
      } catch (err) {
        setFormError('Terjadi kesalahan jaringan saat mendaftar.');
      }
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password
    });

    if ((result as any)?.error) {
      const authErr = (result as any).error;
      const displayMsg = authErr.includes('HTML') || authErr.includes('unreachable') 
        ? authErr 
        : 'Email / NIS / NUPTK atau Password yang Anda masukkan tidak sesuai dengan data terdaftar. Silakan periksa kembali.';
      setFormError(displayMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-blue flex flex-col items-center justify-center p-4 relative overflow-hidden" suppressHydrationWarning>
      {/* Grid Background Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center'
        }}
      />

      {/* Animated subtle glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-blue-light rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-yellow rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-3 relative flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-smkn9.png" alt="Logo SMKN 9" className="w-full h-full object-contain filter drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-black text-white mb-1 tracking-wider">SI ULIN</h1>
          <p className="text-blue-100 text-sm font-bold tracking-wide">Sistem Ujian Online</p>
          <p className="text-blue-200 text-[11px] font-semibold tracking-widest uppercase mt-0.5">SMKN 9 BANDUNG</p>
        </div>

        {/* Login Card */}
        <div className="glass-card w-full rounded-[2rem] p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{isLogin ? 'Selamat Datang 👋' : 'Buat Akun Baru ✨'}</h2>
            <p className="text-sm text-gray-500">{isLogin ? 'Silakan masuk ke akun Anda' : 'Lengkapi data untuk mendaftar'}</p>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold leading-relaxed">
                <p className="font-bold text-sm text-red-800 mb-0.5">Gagal Masuk</p>
                {formError}
              </div>
            </div>
          )}

          {/* Role Tabs */}
          <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-full p-1 mb-8 shadow-inner">
            {(['siswa', 'guru', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setFormError(null); }}
                className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${role === r
                    ? 'bg-accent-yellow text-primary-blue-dark shadow-md transform scale-[1.02]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
                  </div>
                  <input
                    name="name"
                    type="text"
                    className="block w-full pl-11 pr-4 py-3.5 border-0 bg-gray-50/50 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-blue transition-all"
                    placeholder="Nama Lengkap"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {!isLogin && role === 'guru' && (
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
                  </div>
                  <input
                    name="subject"
                    type="text"
                    className="block w-full pl-11 pr-4 py-3.5 border-0 bg-gray-50/50 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-blue transition-all"
                    placeholder="Mata Pelajaran yang Diajar (Wajib)"
                    required={!isLogin && role === 'guru'}
                  />
                </div>
              </div>
            )}
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {role === 'siswa' ? <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" /> : <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />}
                </div>
                <input
                  name="email"
                  type="text"
                  className="block w-full pl-11 pr-4 py-3.5 border-0 bg-gray-50/50 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-blue transition-all"
                  placeholder={role === 'siswa' ? "Email atau NIS/NISN" : role === 'guru' ? "Email atau NUPTK" : "Email Admin"}
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary-blue transition-colors" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-12 py-3.5 border-0 bg-gray-50/50 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-blue transition-all"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-primary-blue/30 text-sm font-bold text-white bg-primary-blue hover:bg-primary-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>{isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang'} <span className="ml-2">→</span></>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setFormError(null); }}
              className="text-sm text-primary-blue hover:text-primary-blue-light font-medium transition-colors"
            >
              {isLogin ? 'Belum punya akun? Daftar sekarang' : 'Sudah punya akun? Masuk di sini'}
            </button>
            {isLogin && (
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-gray-500 hover:text-primary-blue transition-colors"
              >
                Lupa Password?
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center space-x-2 text-white/80 text-sm">
          <span className="text-accent-yellow">⭐</span>
          <span>Unggul</span>
          <span>·</span>
          <span>Berkarakter</span>
          <span>·</span>
          <span>Berprestasi</span>
          <span className="text-accent-yellow">⭐</span>
        </div>
        <div className="mt-2 text-white/50 text-xs">
          SI ULIN SMKN 9 v2.4.1 - 2026
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-in-center">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary-blue" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Lupa Password?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Untuk alasan keamanan, fitur ubah password mandiri saat ini dinonaktifkan. Silakan hubungi <strong>Administrator Sekolah</strong> atau <strong>Wali Kelas</strong> untuk mereset password Anda.
              </p>
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full mt-4 py-3 bg-primary-blue hover:bg-primary-blue-dark text-white rounded-xl font-semibold transition-all"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
