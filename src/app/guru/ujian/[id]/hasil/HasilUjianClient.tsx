'use client';
import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Download, Search, Users, CheckCircle, XCircle, BarChart2, List, Loader2, MessageSquare, AlertTriangle, Clock, ShieldAlert, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import ChatModal from '@/components/ChatModal';

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

  const handleUnsubmit = async (attemptId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan submit ujian siswa ini? Mereka dapat melanjutkan sisa waktunya.')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/attempts/${attemptId}/unsubmit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert('Submit berhasil dibatalkan');
        window.location.reload();
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal membatalkan submit');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleExportExcel = () => {
    if (filteredAttempts.length === 0) {
      alert('Tidak ada data untuk diunduh');
      return;
    }

    const dataToExport = filteredAttempts.map((attempt, index) => ({
      'No': index + 1,
      'Nama Siswa': attempt.user?.name || 'Unknown',
      'Kelas': attempt.user?.kelas || '-',
      'Jurusan': attempt.user?.jurusan || '-',
      'Waktu Selesai': new Date(attempt.finishedAt).toLocaleString('id-ID'),
      'Nilai Akhir': attempt.score,
      'Status': attempt.score >= exam.passingScore ? 'LULUS' : 'REMEDIAL'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Ujian");
    const fileName = `Hasil_${exam.title}_${selectedKelas}.xlsx`.replace(/ /g, '_');
    XLSX.writeFile(wb, fileName);
  };

  const totalPassed = filteredAttempts.filter(a => a.score >= exam.passingScore).length;
  const totalFailed = filteredAttempts.length - totalPassed;

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
                <th className="px-6 py-4 font-semibold text-right">Nilai</th>
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
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
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
                      <div className="flex items-center justify-center gap-2">
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data hasil ujian yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : activeTab === 'analisis' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 animate-in fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Analisis Butir Soal</h2>
          
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
                    <th className="px-4 py-3 font-semibold">Potongan Soal</th>
                    <th className="px-4 py-3 font-semibold text-center text-green-600">Benar</th>
                    <th className="px-4 py-3 font-semibold text-center text-red-600">Salah</th>
                    <th className="px-4 py-3 font-semibold text-center text-gray-400">Kosong</th>
                    <th className="px-4 py-3 font-semibold text-right">% Benar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analisis.analysis.map((item: any) => (
                    <tr key={item.question_id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-center font-bold text-gray-400">{item.no}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-xs" title={item.question_text}>
                        {item.question_text.length > 50 ? item.question_text.substring(0, 50) + '...' : item.question_text}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-green-600 bg-green-50/30">{item.correct_count}</td>
                      <td className="px-4 py-3 text-center font-bold text-red-600 bg-red-50/30">{item.wrong_count}</td>
                      <td className="px-4 py-3 text-center font-bold text-gray-400 bg-gray-50/50">{item.unanswered_count}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                          item.correct_percentage >= 70 ? 'bg-green-100 text-green-800' : 
                          item.correct_percentage >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.correct_percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
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
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                          <AlertTriangle className="w-4 h-4" /> {attempt.cheat_logs.length}x Pelanggaran
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
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
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
    </div>
  );
}
