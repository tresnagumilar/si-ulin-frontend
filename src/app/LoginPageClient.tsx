'use client';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Key } from 'lucide-react';
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
          alert(regData.message || 'Gagal mendaftar');
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
          alert((result as any).error);
          setIsLogin(true);
        }
      } catch (err) {
        alert('Terjadi kesalahan saat mendaftar');
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
      alert((result as any).error);
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
            <p className="text-gray-500 text-sm">{isLogin ? 'Masuk untuk melanjutkan' : 'Daftar untuk mulai menggunakan aplikasi'}</p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-full p-1 mb-8 shadow-inner">
            {(['siswa', 'guru', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
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

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-400 bg-white px-2">atau gunakan</span>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                document.cookie = `selectedRole=${role.toUpperCase()}; path=/`;
                signIn("google", { callbackUrl: "/" });
              }}
              className="w-full flex justify-center items-center py-3.5 px-4 border-2 border-gray-100 rounded-2xl bg-white/50 hover:bg-white text-sm font-semibold text-gray-700 transition-all hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google Workspace
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
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
