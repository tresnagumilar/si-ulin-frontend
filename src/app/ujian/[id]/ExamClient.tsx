'use client';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Flag, ShieldAlert, Check, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useExamStore } from '@/store/examStore';

interface Question {
  id: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE?: string | null;
}

interface ExamClientProps {
  exam: { id: string; title: string; durationMin: number };
  questions: Question[];
}

export default function ExamClient({ exam, questions }: ExamClientProps) {
  const router = useRouter();
  
  // Zustand Store
  const { examId, serverEndTime, answers, startExam, setAnswer, finishExam, resetExam } = useExamStore();

  // Local State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Anti-Cheat states
  const [warnings, setWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const maxWarnings = 3;

  // Initialize Exam
  useEffect(() => {
    const initExam = async () => {
      // If store doesn't match current exam, or hasn't started
      if (examId !== exam.id || !serverEndTime) {
        try {
          const res = await fetch('/api/exam/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ examId: exam.id }),
          });
          if (res.ok) {
            startExam(exam.id, exam.durationMin);
          } else {
            alert("Gagal memulai ujian");
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    initExam();
  }, [exam.id, exam.durationMin, examId, serverEndTime, startExam]);

  // Timer Effect
  useEffect(() => {
    if (!serverEndTime) return;

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
  }, [serverEndTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submission
  const handleForceSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: exam.id, answers }),
      });
      
      if (res.ok) {
        finishExam();
        router.replace('/dashboard/siswa/nilai');
      } else {
        const err = await res.json();
        alert(err.error || "Gagal mengumpulkan ujian.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan saat mengumpulkan ujian.");
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, exam.id, finishExam, isSubmitting, router]);

  // --- ANTI CHEAT MODULE ---
  const handleCheatDetected = useCallback(() => {
    setWarnings(prev => {
      const newWarnings = prev + 1;
      if (newWarnings >= maxWarnings) {
        handleForceSubmit();
      } else {
        setShowWarningModal(true);
      }
      return newWarnings;
    });
  }, [handleForceSubmit]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleCheatDetected();
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) e.preventDefault();
      if (e.ctrlKey && ['u', 'p', 'c', 'v'].includes(e.key)) e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', (e) => e.preventDefault());

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', (e) => e.preventDefault());
    };
  }, [handleCheatDetected]);

  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    alert("Tindakan menyalin/menempel tidak diizinkan selama ujian.");
  };

  const currentQ = questions[currentIdx];
  if (!currentQ) return <div className="p-8 text-center">Memuat soal...</div>;

  return (
    <div 
      className="flex flex-col h-screen max-h-screen bg-gray-50 select-none overflow-hidden"
      onCopy={preventCopyPaste}
      onCut={preventCopyPaste}
      onPaste={preventCopyPaste}
    >
      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Peringatan Keamanan!</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Anda terdeteksi meninggalkan halaman ujian atau melakukan tindakan mencurigakan. 
              <br/><br/>
              <span className="font-bold text-red-600">Peringatan: {warnings} dari {maxWarnings}</span>
            </p>
            <button 
              onClick={() => setShowWarningModal(false)}
              className="w-full bg-primary-blue text-white font-bold py-3 rounded-xl hover:bg-primary-blue-dark transition-colors"
            >
              Saya Mengerti & Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-primary-blue-dark text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md relative z-10">
        <div className="flex-1">
          <h1 className="font-bold text-lg leading-tight">{exam.title}</h1>
          <p className="text-[10px] text-blue-200 uppercase tracking-wider">Ujian Tengah Semester</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold font-mono text-white tracking-wider flex items-center gap-2">
            {formatTime(timeLeft)}
          </div>
          <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest bg-white/10 px-3 rounded-full mt-1">Tersisa</span>
        </div>
        
        <div className="flex-1 flex justify-end">
          <button onClick={handleForceSubmit} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full font-bold shadow-md transition-colors">
            Kumpulkan
          </button>
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
            
            <div className="text-gray-800 text-lg md:text-xl font-medium mb-8 leading-relaxed whitespace-pre-wrap">
              {currentQ.content}
            </div>
            
            <div className="space-y-3 mt-auto">
              {[currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD, currentQ.optionE].filter(Boolean).map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = answers[currentQ.id]?.selectedOption === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => setAnswer(currentQ.id, letter)}
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
               if (confirm("Apakah Anda yakin ingin mengumpulkan ujian?")) {
                 handleForceSubmit();
               }
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
