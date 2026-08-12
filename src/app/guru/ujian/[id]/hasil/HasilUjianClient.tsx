'use client';
import { useState, useMemo, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { Download, Search, Users, CheckCircle, XCircle, BarChart2, List, Loader2, MessageSquare, AlertTriangle, Clock, ShieldAlert, Eye, Edit3, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import ChatModal from '@/components/ChatModal';
import { getImageUrl } from '@/lib/image';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function HasilUjianClient({ exam, initialAttempts }: { exam: any, initialAttempts: any[] }) {
  const { data: session } = useSession();
  const token = (session?.user as any)?.token;
  
  const [activeTab, setActiveTab] = useState<'hasil' | 'analisis' | 'log'>('hasil');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('Semua Kelas');
  const [analisis, setAnalisis] = useState<any>(null);
  const [loadingAnalisis, setLoadingAnalisis] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<{id: string, name: string} | null>(null);
  const [selectedCheatLog, setSelectedCheatLog] = useState<any[] | null>(null);
  const [selectedCheatStudent, setSelectedCheatStudent] = useState<string>('');

  // Custom Alert & Confirm Modals
  const [alertData, setAlertData] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'error' | 'warning' | 'info' | 'success' }>({
    isOpen: false, message: ''
  });
  const [confirmData, setConfirmData] = useState<{ isOpen: boolean; title?: string; message: string; onConfirm: () => void }>({
    isOpen: false, message: '', onConfirm: () => {}
  });

  const showAlert = (message: string, title = 'Pemberitahuan', type: 'error' | 'warning' | 'info' | 'success' = 'warning') => {
    setAlertData({ isOpen: true, title, message, type });
  };

  const showConfirm = (message: string, onConfirm: () => void, title = 'Konfirmasi Aksi') => {
    setConfirmData({ isOpen: true, title, message, onConfirm });
  };

  // Essay Grading Modal state
  const [essayModalOpen, setEssayModalOpen] = useState(false);
  const [gradingAttempt, setGradingAttempt] = useState<any>(null);
  const [essayGrades, setEssayGrades] = useState<{ [qId: string]: number }>({});
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  // Expandable row in Item Analysis
  const [expandedQId, setExpandedQId] = useState<string | null>(null);
  const [onlyCorrectFilter, setOnlyCorrectFilter] = useState(false);
  const [sortByWrong, setSortByWrong] = useState<'default' | 'siswa' | 'kelas' | 'jurusan'>('default');

  // Extract unique classes
  const kelasOptions = useMemo(() => {
    const classes = new Set(initialAttempts.map(a => a.user?.kelas).filter(Boolean));
    return ['Semua Kelas', ...Array.from(classes)].sort();
  }, [initialAttempts]);

  // Filter logic
  const filteredAttempts = useMemo(() => {
    return initialAttempts.filter(attempt => {
      const matchName = attempt.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKelas = selectedKelas === 'Semua Kelas' || attempt.user?.kelas === selectedKelas;
      return matchName && matchKelas;
    });
  }, [initialAttempts, searchTerm, selectedKelas]);

  // Fetch analisis
  const fetchAnalisis = async () => {
    if (analisis || !token) return;
    setLoadingAnalisis(true);
    try {
      const res = await fetch(`http://localhost:8000/api/exams/${exam.id}/item-analysis`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalisis(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingAnalisis(false);
  };

  const handleTabChange = (tab: 'hasil' | 'analisis' | 'log') => {
    setActiveTab(tab);
    if (tab === 'analisis') {
      fetchAnalisis();
    }
  };

  const handleUnsubmit = (attemptId: string) => {
    showConfirm('Apakah Anda yakin ingin membatalkan submit ujian siswa ini? Mereka dapat melanjutkan sisa waktunya.', async () => {
      setConfirmData({ ...confirmData, isOpen: false });
      try {
        const res = await fetch(`http://localhost:8000/api/admin/attempts/${attemptId}/unsubmit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          showAlert('Submit berhasil dibatalkan!', 'Berhasil', 'success');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          const err = await res.json();
          showAlert(err.error || 'Gagal membatalkan submit', 'Gagal', 'error');
        }
      } catch (e) {
        showAlert('Terjadi kesalahan jaringan', 'Error', 'error');
      }
    });
  };

  const handleOpenEssayModal = (attempt: any) => {
    setGradingAttempt(attempt);
    const initialGrades: { [qId: string]: number } = {};
    if (attempt.answers) {
      attempt.answers.forEach((ans: any) => {
        if (ans.question && ans.question.type === 'ESSAY') {
          initialGrades[ans.questionId] = ans.essay_score ?? 0;
        }
      });
    }
    setEssayGrades(initialGrades);
    setEssayModalOpen(true);
  };

  const handleSubmitEssayGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAttempt) return;

    setIsSubmittingGrade(true);
    const gradesArray = Object.keys(essayGrades).map(qId => ({
      questionId: qId,
      score: essayGrades[qId]
    }));

    try {
      const res = await fetch(`http://localhost:8000/api/admin/attempts/${gradingAttempt.id}/grade-essay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ grades: gradesArray })
      });
      if (res.ok) {
        showAlert('Penilaian esai berhasil disimpan!', 'Berhasil', 'success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showAlert('Gagal menyimpan penilaian esai', 'Gagal', 'error');
      }
    } catch (err) {
      showAlert('Terjadi kesalahan jaringan', 'Error', 'error');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const handleExportExcel = () => {
    if (filteredAttempts.length === 0) {
      showAlert('Tidak ada data hasil ujian untuk diunduh.', 'Data Kosong', 'info');
      return;
    }

    const stripHtml = (text: string) => text ? text.replace(/<[^>]*>?/gm, '').trim() : '';

    const dataToExport = filteredAttempts.map((attempt, index) => {
      const row: Record<string, any> = {
        'No': index + 1,
        'Nama Siswa': attempt.user?.name || 'Unknown',
        'Kelas': attempt.user?.kelas || '-',
        'Jurusan': attempt.user?.jurusan || '-',
        'Waktu Selesai': attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString('id-ID') : '-',
        'Nilai Pilihan Ganda': attempt.pg_score ?? attempt.score,
        'Nilai Esai': attempt.essay_score ?? '-',
        'Nilai Akhir': attempt.score,
        'Status': attempt.score >= exam.passingScore ? 'LULUS' : 'REMEDIAL'
      };

      if (exam.questions && exam.questions.length > 0) {
        exam.questions.forEach((q: any, qIdx: number) => {
          const ans = attempt.answers?.find((a: any) => a.questionId === q.id);
          const cleanQ = stripHtml(q.content || '');
          const shortQ = cleanQ.length > 45 ? cleanQ.substring(0, 45) + '...' : cleanQ;
          const colKey = `Soal ${qIdx + 1}: ${shortQ}`;

          if (!ans || !ans.answer) {
            row[colKey] = 'Kosong';
          } else if (q.type === 'ESSAY') {
            const scoreStr = ans.essay_score !== null && ans.essay_score !== undefined ? ` [Skor: ${ans.essay_score}]` : '';
            row[colKey] = `${ans.answer}${scoreStr}`;
          } else {
            const chosenOpt = ans.answer.trim().toUpperCase();
            const optText = q[`option${chosenOpt}`] ? stripHtml(q[`option${chosenOpt}`]) : '';
            const isCorrect = q.answer ? (chosenOpt === q.answer.trim().toUpperCase()) : false;
            const displayOpt = optText ? `${chosenOpt}. ${optText}` : chosenOpt;
            
            row[colKey] = isCorrect
              ? `${displayOpt} (Benar)`
              : `${displayOpt} (Salah - Kunci: ${q.answer || '-'})`;
          }
        });
      }

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Ujian");
    const fileName = `Hasil_${exam.title}_${selectedKelas}.xlsx`.replace(/ /g, '_');
    XLSX.writeFile(wb, fileName);
  };

  const totalPassed = filteredAttempts.filter(a => a.score >= exam.passingScore).length;
  const totalFailed = filteredAttempts.length - totalPassed;
  const hasEssayQuestions = exam.questions?.some((q: any) => q.type === 'ESSAY');

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-primary-blue rounded-full flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Peserta</p>
            <p className="text-2xl font-bold text-gray-900">{filteredAttempts.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Lulus (≥ {exam.passingScore})</p>
            <p className="text-2xl font-bold text-gray-900">{totalPassed}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Belum Lulus</p>
            <p className="text-2xl font-bold text-gray-900">{totalFailed}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => handleTabChange('hasil')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'hasil' ? 'bg-white text-primary-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <List className="w-4 h-4" /> Hasil Siswa
        </button>
        <button
          onClick={() => handleTabChange('analisis')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'analisis' ? 'bg-white text-primary-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <BarChart2 className="w-4 h-4" /> Analisis Butir Soal
        </button>
        <button
          onClick={() => handleTabChange('log')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'log' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ShieldAlert className="w-4 h-4" /> Log Pelanggaran
        </button>
      </div>

      {activeTab === 'hasil' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Cari nama siswa..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none text-sm transition-all"
              />
            </div>
            
            <select
              value={selectedKelas}
              onChange={e => setSelectedKelas(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-blue outline-none cursor-pointer"
            >
              {kelasOptions.map(kelas => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleExportExcel}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm shadow-green-200"
          >
            <Download className="w-4 h-4" />
            Unduh Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Peringkat</th>
                <th className="px-6 py-4 font-semibold">Siswa</th>
                <th className="px-6 py-4 font-semibold">Kelas</th>
                <th className="px-6 py-4 font-semibold">Waktu Selesai</th>
                {hasEssayQuestions && <th className="px-4 py-4 font-semibold text-center">Nilai PG</th>}
                {hasEssayQuestions && <th className="px-4 py-4 font-semibold text-center">Nilai Esai</th>}
                <th className="px-6 py-4 font-semibold text-right">Nilai Akhir</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttempts.length > 0 ? filteredAttempts.map((attempt, index) => {
                const isLulus = attempt.score >= exam.passingScore;
                return (
                  <tr key={attempt.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-400">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-bold text-gray-900">{attempt.user?.name}</p>
                          <p className="text-xs text-gray-500">{attempt.user?.email}</p>
                        </div>
                        {attempt.cheat_logs && attempt.cheat_logs.length > 0 && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5" title={`${attempt.cheat_logs.length} Pelanggaran`}>
                            <AlertTriangle className="w-3 h-3" /> {attempt.cheat_logs.length}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {attempt.user?.kelas ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {attempt.user?.kelas} {attempt.user?.jurusan}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                          Belum Pilih Kelas
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(attempt.finishedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    {hasEssayQuestions && (
                      <td className="px-4 py-4 text-center font-semibold text-gray-700">
                        {attempt.pg_score ?? attempt.score}
                      </td>
                    )}
                    {hasEssayQuestions && (
                      <td className="px-4 py-4 text-center">
                        <span className={`font-semibold ${attempt.essay_score !== null ? 'text-purple-700' : 'text-amber-600 font-normal italic text-xs'}`}>
                          {attempt.essay_score !== null ? attempt.essay_score : 'Belum Dinilai'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <span className={`text-xl font-black ${isLulus ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isLulus ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                          <CheckCircle className="w-3 h-3" /> LULUS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                          <XCircle className="w-3 h-3" /> REMEDIAL
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {hasEssayQuestions && (
                          <button
                            onClick={() => handleOpenEssayModal(attempt)}
                            className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors border border-purple-200 flex items-center gap-1"
                            title="Nilai Jawaban Esai Siswa"
                          >
                            <Edit3 className="w-3 h-3" /> Nilai Esai
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedAttempt({ id: attempt.id, name: attempt.user?.name });
                            setChatOpen(true);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 flex items-center gap-1"
                          title="Komentar / Diskusi"
                        >
                          <MessageSquare className="w-3 h-3" /> Chat
                        </button>
                        <button 
                          onClick={() => handleUnsubmit(attempt.id)}
                          className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                          title="Batalkan Kumpulkan"
                        >
                          Unsubmit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data hasil ujian yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : activeTab === 'analisis' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-in fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Analisis Butir Soal</h2>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700">
                <input 
                  type="checkbox"
                  checked={onlyCorrectFilter}
                  onChange={e => setOnlyCorrectFilter(e.target.checked)}
                  className="rounded text-primary-blue"
                />
                Tampilkan Hanya Siswa yang Benar
              </label>

              <select 
                value={sortByWrong}
                onChange={e => setSortByWrong(e.target.value as any)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
              >
                <option value="default">Sortir Standar</option>
                <option value="siswa">Per Siswa (Urut Paling Banyak Salah)</option>
                <option value="kelas">Per Kelas</option>
              </select>
            </div>
          </div>
          
          {loadingAnalisis ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-blue" />
              <p>Memuat data analisis...</p>
            </div>
          ) : !analisis || analisis.analysis.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              Belum ada data analisis soal untuk ujian ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold text-center w-12">No</th>
                    <th className="px-4 py-3 font-semibold">DETIL SOAL & JAWABAN</th>
                    <th className="px-4 py-3 font-semibold text-center text-green-600">Benar</th>
                    <th className="px-4 py-3 font-semibold text-center text-red-600">Salah</th>
                    <th className="px-4 py-3 font-semibold text-center text-gray-400">Kosong</th>
                    <th className="px-4 py-3 font-semibold text-center w-16">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analisis.analysis
                    .filter((item: any) => onlyCorrectFilter ? item.correct_count > 0 : true)
                    .sort((a: any, b: any) => sortByWrong === 'siswa' ? b.wrong_count - a.wrong_count : a.no - b.no)
                    .map((item: any) => {
                      const isExpanded = expandedQId === item.question_id;
                      const qDetail = exam.questions?.find((q: any) => q.id === item.question_id);

                      return (
                        <Fragment key={item.question_id}>
                          <tr 
                            onClick={() => setExpandedQId(isExpanded ? null : item.question_id)}
                            className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 text-center font-bold text-gray-400">{item.no}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              {item.question_text.length > 70 ? item.question_text.substring(0, 70) + '...' : item.question_text}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-green-600 bg-green-50/30">{item.correct_count}</td>
                            <td className="px-4 py-3 text-center font-bold text-red-600 bg-red-50/30">{item.wrong_count}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-400 bg-gray-50/50">{item.unanswered_count}</td>
                            <td className="px-4 py-3 text-center">
                              <button className="p-1 text-gray-400 hover:text-primary-blue">
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expandable Detail View */}
                          {isExpanded && qDetail && (
                            <tr className="bg-blue-50/30">
                              <td colSpan={6} className="p-6">
                                <div className="space-y-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-gray-900 text-base">Soal #{item.no}: {qDetail.content}</h4>
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                                      {qDetail.type === 'ESSAY' ? 'Esai' : 'Pilihan Ganda'}
                                    </span>
                                  </div>

                                  {qDetail.imageUrl && (
                                    <img src={getImageUrl(qDetail.imageUrl)} alt="Gambar Soal" className="max-w-xs max-h-48 object-contain rounded-lg border" />
                                  )}

                                  {qDetail.type === 'ESSAY' ? (
                                    <div className="p-3 bg-purple-50 rounded-xl text-sm">
                                      <span className="font-bold text-purple-900 block mb-1">Pedoman / Kunci Jawaban Esai:</span>
                                      <p className="text-gray-700 italic">{qDetail.essay_answer_key || 'Belum diisi'}</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                      {['A', 'B', 'C', 'D', 'E'].map(opt => {
                                        const val = qDetail[`option${opt}`];
                                        if (!val) return null;
                                        const isCorrectKey = qDetail.answer === opt;
                                        const count = item.option_counts?.[opt] || 0;
                                        const isChosenWrong = count > 0 && !isCorrectKey;

                                        return (
                                          <div 
                                            key={opt} 
                                            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                                              isCorrectKey 
                                                ? 'bg-green-50 border-green-300 font-bold text-green-900 shadow-sm ring-1 ring-green-400/30' 
                                                : isChosenWrong 
                                                  ? 'bg-red-50/80 border-red-200 text-red-900 shadow-sm'
                                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                                            }`}
                                          >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                              <div>
                                                <span className={`mr-2 font-bold ${isCorrectKey ? 'text-green-700' : isChosenWrong ? 'text-red-700' : 'text-gray-500'}`}>{opt}.</span> 
                                                <span>{val}</span>
                                              </div>
                                              {isCorrectKey && <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-bold shrink-0">KUNCI</span>}
                                              {isChosenWrong && <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold shrink-0">DIPILIH SISWA (SALAH)</span>}
                                            </div>

                                            <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs font-semibold">
                                              <span className={isCorrectKey ? 'text-green-700' : isChosenWrong ? 'text-red-700 font-bold' : 'text-gray-400'}>
                                                {count} Siswa Memilih
                                              </span>
                                              {count > 0 && (
                                                <span className="text-[10px] opacity-75">
                                                  ({Math.round((count / (analisis.total_students || 1)) * 100)}%)
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rekap Log Pelanggaran</h2>
              <p className="text-sm text-gray-500">Daftar aktivitas mencurigakan selama ujian berlangsung.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Siswa</th>
                  <th className="px-6 py-4 font-semibold">Kelas</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Pelanggaran</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttempts.filter(a => a.cheat_logs && a.cheat_logs.length > 0).length > 0 ? (
                  filteredAttempts.filter(a => a.cheat_logs && a.cheat_logs.length > 0).map(attempt => (
                    <tr key={attempt.id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{attempt.user?.name}</p>
                        <p className="text-xs text-gray-500">{attempt.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {attempt.user?.kelas} {attempt.user?.jurusan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" /> {attempt.cheat_logs.length}x Pelanggaran
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedCheatLog(attempt.cheat_logs);
                            setSelectedCheatStudent(attempt.user?.name || 'Unknown');
                          }}
                          className="text-sm font-bold text-primary-blue hover:text-primary-blue-dark bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors inline-flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                        <p>Tidak ada catatan pelanggaran untuk ujian ini. Semua aman!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Essay Grading Modal */}
      {essayModalOpen && gradingAttempt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-purple-50/50">
              <div>
                <h3 className="text-xl font-bold text-purple-950 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-600" /> Penilaian Jawaban Esai
                </h3>
                <p className="text-sm text-gray-500 mt-1">Siswa: <span className="font-bold text-gray-900">{gradingAttempt.user?.name}</span></p>
              </div>
              <button 
                onClick={() => setEssayModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEssayGrades} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50/50">
                {(
                  exam.questions?.filter((q: any) => q.type === 'ESSAY').length > 0
                    ? exam.questions?.filter((q: any) => q.type === 'ESSAY')
                    : gradingAttempt.answers?.map((a: any) => a.question).filter((q: any) => q && q.type === 'ESSAY')
                )?.map((q: any, idx: number) => {
                  const ans = gradingAttempt.answers?.find((a: any) => a.questionId === q.id || a.question?.id === q.id);
                  const studentAnswerText = ans?.essay_answer || ans?.answer || '(Siswa tidak mengetik jawaban esai)';

                  return (
                    <div key={q.id || idx} className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-sm">Soal #{idx + 1}: {q.content || q.questionText}</h4>
                      </div>

                      {q.essay_answer_key && (
                        <div className="p-3 bg-purple-50/80 rounded-xl text-xs text-purple-900 border border-purple-100">
                          <span className="font-bold block mb-0.5">Pedoman / Kunci Jawaban Guru:</span>
                          <p className="italic">{q.essay_answer_key}</p>
                        </div>
                      )}

                      <div className="p-4 bg-purple-50/30 rounded-xl border border-purple-100">
                        <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-1">Jawaban Siswa:</span>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap font-medium">{studentAnswerText}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Input Nilai Esai (0 - 100)</label>
                        <input 
                          type="number" min="0" max="100" required
                          value={essayGrades[q.id] ?? (ans?.essay_score ?? 0)}
                          onChange={e => setEssayGrades({ ...essayGrades, [q.id]: parseFloat(e.target.value) || 0 })}
                          className="w-36 px-4 py-2 border border-purple-300 rounded-xl font-bold text-purple-700 focus:ring-2 focus:ring-purple-600 outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEssayModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingGrade}
                  className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSubmittingGrade ? 'Menyimpan...' : 'Simpan Nilai Esai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cheat Logs Modal */}
      {selectedCheatLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Detail Pelanggaran</h3>
                <p className="text-sm text-gray-500 mt-1">Siswa: <span className="font-bold text-gray-700">{selectedCheatStudent}</span></p>
              </div>
              <button 
                onClick={() => setSelectedCheatLog(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {selectedCheatLog.map((log, index) => (
                  <div key={log.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-red-100 text-red-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-red-700 text-sm">Peringatan #{index + 1}</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-50 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3" />
                          {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{log.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-white text-right">
              <button 
                onClick={() => setSelectedCheatLog(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAttempt && (
        <ChatModal 
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          attemptId={selectedAttempt.id}
          title={`Diskusi Ujian: ${selectedAttempt.name}`}
        />
      )}

      <AlertModal 
        isOpen={alertData.isOpen}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
      />

      <ConfirmModal
        isOpen={confirmData.isOpen}
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={confirmData.onConfirm}
        onCancel={() => setConfirmData({ ...confirmData, isOpen: false })}
      />
    </div>
  );
}
