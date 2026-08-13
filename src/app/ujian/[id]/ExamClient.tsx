'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight, Flag, ShieldAlert, Check, AlertTriangle, Play, Maximize } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useExamStore } from '@/store/examStore';
import { getImageUrl } from '@/lib/image';
import AlertModal from '@/components/AlertModal';
import { API_URL } from '@/lib/api';

interface Question {
  id: string;
  type?: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE?: string | null;
  imageUrl?: string | null;
}

interface ExamClientProps {
  exam: { id: string; title: string; durationMin: number; requiresToken?: boolean };
  questions: Question[];
  token: string;
}

export default function ExamClient({ exam, questions, token }: ExamClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id || '';
  
  // Zustand Store
  const { examId, userId, attemptId, serverEndTime, answers, isFinished, startExam, setAnswer, finishExam, resetExam } = useExamStore();

  // Local State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Custom Alert Modal state
  const [alertData, setAlertData] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'error' | 'warning' | 'info' }>({
    isOpen: false,
    message: ''
  });

  const showAlert = (message: string, title = 'Pemberitahuan', type: 'error' | 'warning' | 'info' = 'warning') => {
    setAlertData({ isOpen: true, title, message, type });
  };

  // Anti-Cheat states
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const maxWarnings = 3;

  // Token state
  const [inputToken, setInputToken] = useState('');
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(!exam.requiresToken);

  const initExam = async () => {
    try {
      // Check if store already has a running attempt for THIS exam AND THIS exact logged-in user
      if (examId === exam.id && userId === currentUserId && attemptId && serverEndTime && Date.now() < serverEndTime && !isFinished) {
        setHasStarted(true);
        return;
      }

      // If store belongs to another user or another exam or is finished, reset store first!
      if (userId !== currentUserId || examId !== exam.id || isFinished) {
        resetExam();
      }
      
      const res = await fetch(`${API_URL}/api/attempts/start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ examId: exam.id }),
      });
      if (res.ok) {
        const data = await res.json();
        startExam(exam.id, data.id, currentUserId, exam.durationMin);
        setHasStarted(true);
      } else {
        showAlert("Gagal memulai sesi ujian baru untuk akun Anda.", "Akses Ditolak", "error");
        router.push('/dashboard/siswa');
      }
    } catch (e) {
      console.error(e);
      showAlert("Terjadi kesalahan jaringan saat mulai ujian.", "Kesalahan Jaringan", "error");
    }
  };

  const handleStartWithFullScreen = async () => {
    const tokenKey = `tokenUsage_${currentUserId}_${exam.id}`;

    // If exam requires token and not verified yet
    if (exam.requiresToken && !tokenVerified) {
      if (!inputToken) {
        showAlert("Masukkan token ujian terlebih dahulu!", "Token Diperlukan", "warning");
        return;
      }
      setIsVerifyingToken(true);
      try {
        const res = await fetch(`${API_URL}/api/attempts/verify-token`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ examId: exam.id, token: inputToken }),
        });
        const data = await res.json();
        
        if (res.ok) {
          const currentUsageCount = parseInt(localStorage.getItem(tokenKey) || '0');
          if (currentUsageCount >= 3) {
            showAlert("Anda telah mencapai batas maksimal (3 kali) menggunakan token untuk masuk ke ujian ini.", "Batas Maksimal Token", "error");
            setIsVerifyingToken(false);
            return;
          }
          localStorage.setItem(tokenKey, (currentUsageCount + 1).toString());
          setTokenVerified(true);
        } else {
          showAlert(data.error || "Token tidak valid", "Verifikasi Token Gagal", "error");
          setIsVerifyingToken(false);
          return;
        }
      } catch (err) {
        showAlert("Terjadi kesalahan jaringan saat verifikasi token", "Kesalahan Jaringan", "error");
        setIsVerifyingToken(false);
        return;
      }
      setIsVerifyingToken(false);
    } else if (exam.requiresToken && tokenVerified) {
        const currentUsageCount = parseInt(localStorage.getItem(tokenKey) || '0');
        if (currentUsageCount > 3) {
           showAlert("Anda telah mencapai batas maksimal (3 kali) menggunakan token untuk masuk ke ujian ini.", "Batas Maksimal Token", "error");
           return;
        }
    }

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      initExam();
    } catch (err) {
      showAlert("Gagal memasuki mode Full-Screen. Ujian membutuhkan mode Full-Screen.", "Mode Full-Screen Wajib", "warning");
    }
  };

  // Handle Answer Selection directly to API
  const handleSelectAnswer = async (questionId: string, letter: string) => {
    setAnswer(questionId, letter);
    if (!attemptId) return;

    try {
      await fetch(`${API_URL}/api/attempts/${attemptId}/answer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questionId, answer: letter }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (!serverEndTime || !hasStarted) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((serverEndTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        handleForceSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [serverEndTime, hasStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submission
  const handleForceSubmit = useCallback(async () => {
    if (isSubmittingRef.current || !attemptId) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/api/attempts/${attemptId}/finish`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (res.ok) {
        finishExam();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(e => console.log(e));
        }
        router.replace(`/ujian/${exam.id}/selesai`);
      } else {
        const err = await res.json();
        showAlert(err.error || "Gagal mengumpulkan ujian.", "Gagal Submit", "error");
      }
    } catch (e) {
      console.error(e);
      showAlert("Terjadi kesalahan jaringan saat mengumpulkan ujian.", "Kesalahan Jaringan", "error");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [attemptId, finishExam, router, token]);

  // --- ANTI CHEAT MODULE ---
  const handleCheatDetected = useCallback(async (reason: string) => {
    if (!attemptId || !hasStarted) return;

    try {
      await fetch(`${API_URL}/api/attempts/${attemptId}/cheat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: reason })
      });
    } catch (e) {
      console.error("Gagal mencatat log kecurangan", e);
    }

    setWarnings(prev => {
      const newWarnings = prev + 1;
      if (newWarnings >= maxWarnings) {
        handleForceSubmit();
      } else {
        setShowWarningModal(true);
      }
      return newWarnings;
    });
  }, [attemptId, hasStarted, handleForceSubmit, token]);

  useEffect(() => {
    if (!hasStarted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleCheatDetected("Meninggalkan Tab / Pindah Aplikasi");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !isSubmittingRef.current) {
        handleCheatDetected("Keluar dari Mode Fullscreen");
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) e.preventDefault();
      if (e.ctrlKey && ['u', 'p', 'c', 'v'].includes(e.key)) e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', (e) => e.preventDefault());

    window.history.pushState(null, "", window.location.href);
    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
      handleCheatDetected("Mencoba Kembali (Back) dari Halaman Ujian");
    };
    window.addEventListener('popstate', preventBack);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', (e) => e.preventDefault());
      window.removeEventListener('popstate', preventBack);
    };
  }, [hasStarted, handleCheatDetected]);

  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    showAlert("Tindakan menyalin atau menempel teks tidak diizinkan selama ujian berlangsung.", "Tindakan Dilarang", "warning");
  };

  // Splash Screen if not started
  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <AlertModal 
          isOpen={alertData.isOpen}
          title={alertData.title}
          message={alertData.message}
          type={alertData.type}
          onClose={() => setAlertData({ ...alertData, isOpen: false })}
        />

        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Maximize className="w-10 h-10 text-primary-blue" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h2>
          <p className="text-gray-500 mb-6">Ujian ini mewajibkan mode Full-Screen. Pastikan Anda siap dan jangan meninggalkan halaman saat ujian berlangsung.</p>
          
          <div className="bg-accent-yellow/20 p-4 rounded-xl mb-6 text-left border border-accent-yellow/30">
            <h4 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Peraturan Ujian</h4>
            <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
              <li>Dilarang keluar dari mode layar penuh (Full-Screen)</li>
              <li>Dilarang pindah tab atau membuka aplikasi lain</li>
              <li>Dilarang menyalin (Copy) atau menempel (Paste) teks</li>
              <li>Maksimal peringatan pelanggaran adalah {maxWarnings} kali sebelum ujian otomatis dikumpulkan</li>
              <li>Maksimal masuk/login menggunakan token adalah 3 kali per akun</li>
            </ul>
          </div>
          
          {exam.requiresToken && !tokenVerified && (
            <div className="mb-6 text-left">
              <label className="block text-sm font-bold text-gray-700 mb-2">Token Ujian</label>
              <input 
                type="text" 
                placeholder="Masukkan 6 digit token..."
                value={inputToken}
                onChange={e => setInputToken(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl font-mono text-center tracking-widest text-lg font-bold text-gray-900 focus:ring-2 focus:ring-primary-blue outline-none transition-all uppercase"
              />
            </div>
          )}

          <button 
            onClick={handleStartWithFullScreen}
            disabled={isVerifyingToken || (exam.requiresToken && !tokenVerified && inputToken.length < 4)}
            className="w-full bg-primary-blue hover:bg-primary-blue-dark text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            {isVerifyingToken ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-5 h-5" /> 
            )}
            {isVerifyingToken ? "Memverifikasi..." : "Mulai Ujian (Full-Screen)"}
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  if (!currentQ) return <div className="p-8 text-center">Memuat soal...</div>;

  return (
    <div 
      className="flex flex-col h-screen max-h-screen bg-gray-50 select-none overflow-hidden"
      onCopy={preventCopyPaste}
      onCut={preventCopyPaste}
      onPaste={preventCopyPaste}
    >
      <AlertModal 
        isOpen={alertData.isOpen}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
      />

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Peringatan Keamanan!</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Anda terdeteksi melakukan pelanggaran ujian (seperti meninggalkan halaman atau mode full-screen). 
              <br/><br/>
              <span className="font-bold text-red-600">Peringatan: {warnings} dari {maxWarnings}</span>
            </p>
            <button 
              onClick={() => {
                setShowWarningModal(false);
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(e => console.log(e));
                }
              }}
              className="w-full bg-primary-blue text-white font-bold py-3 rounded-xl hover:bg-primary-blue-dark transition-colors"
            >
              Saya Mengerti & Kembali Full-Screen
            </button>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary-blue" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Kumpulkan Ujian?</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Apakah Anda yakin ingin mengumpulkan ujian ini? Jawaban tidak dapat diubah setelah dikumpulkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  setShowSubmitModal(false);
                  await handleForceSubmit();
                }}
                disabled={isSubmitting}
                className="flex-1 bg-primary-blue text-white font-bold py-3 rounded-xl hover:bg-primary-blue-dark transition-colors disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengumpulkan...
                  </span>
                ) : 'Ya, Kumpulkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-primary-blue-dark text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md relative z-10">
        <div className="flex-1">
          <h1 className="font-bold text-lg leading-tight">{exam.title}</h1>
          <p className="text-[10px] text-blue-200 uppercase tracking-wider">SI ULIN (Sistem Ujian Online) • SMKN 9</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold font-mono text-white tracking-wider flex items-center gap-2">
            {formatTime(timeLeft)}
          </div>
          <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest bg-white/10 px-3 rounded-full mt-1">Tersisa</span>
        </div>
        
        <div className="flex-1 flex justify-end">
        </div>
      </header>

      {/* Safe Mode Banner */}
      <div className="bg-accent-yellow/20 border-b border-accent-yellow/30 px-4 py-2 flex items-center justify-center gap-2 shrink-0">
        <ShieldAlert className="w-4 h-4 text-accent-yellow-hover" />
        <span className="text-xs font-bold text-gray-800">Mode Aman Aktif - Jangan tinggalkan halaman ini</span>
        <span className="text-[10px] bg-accent-yellow text-white px-1.5 py-0.5 rounded font-bold uppercase ml-2">SECURE</span>
      </div>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-primary-blue text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                Soal {currentIdx + 1}
              </span>
            </div>
            
            {currentQ.imageUrl && (
              <div className="mb-6 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageUrl(currentQ.imageUrl)} alt="Ilustrasi Soal" className="max-w-full max-h-64 object-contain rounded-xl border border-gray-200 shadow-sm" />
              </div>
            )}
            
            <div className="text-gray-800 text-lg md:text-xl font-medium mb-8 leading-relaxed whitespace-pre-wrap">
              {currentQ.content}
            </div>
            
            {currentQ.type === 'ESSAY' ? (
              <div className="space-y-3 mt-auto">
                <label className="block text-sm font-bold text-purple-900">Jawaban Esai (Uraian) Anda:</label>
                <textarea
                  rows={6}
                  value={answers[currentQ.id]?.selectedOption || ''}
                  onChange={e => handleSelectAnswer(currentQ.id, e.target.value)}
                  placeholder="Ketikkan jawaban lengkap Anda di sini..."
                  className="w-full p-4 rounded-2xl border-2 border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 transition-all font-sans text-base bg-purple-50/20"
                />
              </div>
            ) : (
              <div className="space-y-3 mt-auto">
                {[currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD, currentQ.optionE].filter(Boolean).map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = answers[currentQ.id]?.selectedOption === letter;
                  return (
                    <button
                      key={letter}
                      onClick={() => handleSelectAnswer(currentQ.id, letter)}
                      className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all ${
                        isSelected 
                          ? 'border-primary-blue bg-blue-50/50 shadow-md' 
                          : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-4 transition-colors ${
                        isSelected ? 'bg-primary-blue text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {letter}
                      </span>
                      <span className={`text-left font-medium ${isSelected ? 'text-primary-blue-dark' : 'text-gray-700'}`}>
                        {option}
                      </span>
                      {isSelected && <Check className="w-5 h-5 text-primary-blue ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Navigation */}
        <div className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 max-h-64 md:max-h-none overflow-y-auto">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm mb-3">Navigasi Soal</h3>
            <div className="flex gap-4 text-xs font-medium text-gray-500 justify-between">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary-blue"></span> Dijawab</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-accent-yellow"></span> Ditandai</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-gray-300 bg-white"></span> Belum</span>
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const num = i + 1;
              const hasAnswer = !!answers[q.id];
              const isFlagged = flags[q.id];
              const isCurrent = currentIdx === i;
              
              let bg = 'bg-white border border-gray-200 text-gray-600 hover:border-primary-blue/50';
              if (isCurrent) bg = 'bg-primary-blue text-white font-bold ring-2 ring-primary-blue ring-offset-2';
              else if (isFlagged) bg = 'bg-accent-yellow text-primary-blue-dark font-bold shadow-sm';
              else if (hasAnswer) bg = 'bg-primary-blue text-white font-bold shadow-sm';
              
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all ${bg}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          className="px-5 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>
        
        <button 
          onClick={() => setFlags(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            flags[currentQ.id] 
              ? 'bg-accent-yellow text-primary-blue-dark shadow-md' 
              : 'bg-orange-50 text-orange-500 border border-orange-100 hover:bg-orange-100'
          }`}
        >
          <Flag className={`w-5 h-5 ${flags[currentQ.id] ? 'fill-current' : ''}`} />
        </button>

        <button 
          onClick={() => {
            if (currentIdx === questions.length - 1) {
               setShowSubmitModal(true);
            } else {
               setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1));
            }
          }}
          className="px-6 py-3 rounded-xl font-bold text-white bg-primary-blue hover:bg-primary-blue-dark flex items-center gap-2 shadow-lg shadow-primary-blue/30 transition-all active:scale-95"
        >
          <span className="hidden sm:inline">{currentIdx === questions.length - 1 ? 'Selesai' : 'Berikutnya'}</span>
          {currentIdx === questions.length - 1 ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
