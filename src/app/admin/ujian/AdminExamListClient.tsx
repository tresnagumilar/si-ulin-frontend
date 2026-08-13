'use client';
import { useState } from 'react';
import { Settings, Eye, Trash2, DownloadCloud, Activity, RotateCw } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';
import { API_URL } from '@/lib/api';

type ExamData = {
  id: string;
  title: string;
  subject: string;
  durationMin: number;
  totalQuestions: number;
  isLive: boolean;
  questions_count?: number;
  attempts_count?: number;
  exam_token?: string;
  token_expires_at?: string;
  teacher?: {
    id: string;
    name: string;
  };
};

export default function AdminExamListClient({ initialExams, token }: { initialExams: ExamData[], token: string }) {
  const [exams, setExams] = useState(initialExams);

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

  const showConfirm = (message: string, onConfirm: () => void, title = 'Konfirmasi Hapus') => {
    setConfirmData({ isOpen: true, title, message, onConfirm });
  };

  const toggleLive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${API_URL}/api/exams/${id}/live`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isLive: !currentStatus })
      });
      if (res.ok) {
        setExams(exams.map(e => e.id === id ? { ...e, isLive: !currentStatus } : e));
      }
    } catch (error) {
      alert('Gagal mengubah status');
    }
  };

  const handleGenerateToken = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/exams/${id}/generate-token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExams(exams.map(e => e.id === id ? { ...e, exam_token: data.token, token_expires_at: data.expires_at } : e));
        showAlert('Token baru berhasil dibuat!', 'Berhasil', 'success');
      } else {
        showAlert('Gagal men-generate token baru.', 'Gagal', 'error');
      }
    } catch (error) {
      showAlert('Terjadi kesalahan jaringan.', 'Error', 'error');
    }
  };

  const handleDelete = (id: string) => {
    showConfirm('Apakah Anda yakin ingin menghapus ujian ini secara permanen? Semua data soal dan nilai siswa terkait akan ikut terhapus.', async () => {
      setConfirmData({ ...confirmData, isOpen: false });
      try {
        const res = await fetch(`${API_URL}/api/exams/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setExams(exams.filter(e => e.id !== id));
          showAlert('Ujian berhasil dihapus.', 'Berhasil', 'success');
        } else {
          showAlert('Gagal menghapus ujian.', 'Gagal', 'error');
        }
      } catch (error) {
        showAlert('Terjadi kesalahan jaringan saat menghapus ujian.', 'Error', 'error');
      }
    });
  };

  const handleExport = async (examId: string, examTitle: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/exam/${examId}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal mengambil data nilai');
      const data = await res.json();
      
      const attempts = data.attempts || [];
      const examObj = data.exam || {};
      if (attempts.length === 0) {
        showAlert('Belum ada siswa yang menyelesaikan ujian ini.', 'Informasi', 'info');
        return;
      }

      const stripHtml = (text: string) => text ? text.replace(/<[^>]*>?/gm, '').trim() : '';

      const dataToExport = attempts.map((attempt: any, index: number) => {
        const row: Record<string, any> = {
          'No': index + 1,
          'Nama Siswa': attempt.user?.name || 'Unknown',
          'Kelas': attempt.user?.kelas || '-',
          'Jurusan': attempt.user?.jurusan || '-',
          'Waktu Selesai': attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString('id-ID') : '-',
          'Nilai PG': attempt.pg_score ?? attempt.score,
          'Nilai Esai': attempt.essay_score ?? '-',
          'Nilai Akhir': attempt.score,
          'Status': attempt.score >= (examObj.passingScore || 70) ? 'LULUS' : 'REMEDIAL'
        };

        if (examObj.questions && examObj.questions.length > 0) {
          examObj.questions.forEach((q: any, qIdx: number) => {
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

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai');
      
      XLSX.writeFile(workbook, `Nilai_${examTitle.replace(/\s+/g, '_')}.xlsx`);
    } catch (err) {
      showAlert('Gagal mengekspor data ke Excel.', 'Error', 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
          <tr>
            <th className="px-6 py-4 font-semibold">Judul Ujian</th>
            <th className="px-6 py-4 font-semibold">Mata Pelajaran & Guru</th>
            <th className="px-6 py-4 font-semibold">Statistik</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {exams.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                Belum ada ujian yang dibuat.
              </td>
            </tr>
          ) : (
            exams.map(exam => (
              <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{exam.title}</p>
                  <p className="text-xs text-gray-500">{exam.durationMin} Menit</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold bg-blue-50 text-primary-blue px-2 py-1 rounded border border-blue-100 uppercase inline-block mb-1">
                    {exam.subject}
                  </span>
                  <p className="text-xs text-gray-600 font-medium">Guru: {exam.teacher?.name || 'Tidak diketahui'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm"><span className="font-semibold">{exam.questions_count || 0}</span> Soal</p>
                  <p className="text-xs text-gray-500"><span className="font-semibold">{exam.attempts_count || 0}</span> Pengerjaan</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2 items-start">
                    <button 
                      onClick={() => toggleLive(exam.id, exam.isLive)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
                        exam.isLive 
                        ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {exam.isLive ? '🔴 LIVE' : '⚪ DRAFT'}
                    </button>
                    
                    {exam.isLive && (
                      <div className="mt-2">
                        {exam.exam_token ? (() => {
                          const parseDate = (dStr: string) => {
                            if (!dStr) return new Date(0);
                            const norm = dStr.includes(' ') && !dStr.includes('T') ? dStr.replace(' ', 'T') : dStr;
                            return new Date(norm);
                          };
                          const expDate = parseDate(exam.token_expires_at!);
                          const isExpired = exam.token_expires_at ? new Date() > expDate : false;
                          return (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500 font-medium">Token Ujian:</span>
                                {isExpired && (
                                  <span className="text-[10px] font-bold text-red-600 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded">
                                    EXPIRED
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold tracking-wider text-sm px-2 py-0.5 rounded border ${
                                  isExpired 
                                    ? 'bg-red-50 text-red-600 border-red-200 line-through' 
                                    : 'bg-blue-50 text-primary-blue-dark border-blue-100'
                                }`}>
                                  {exam.exam_token}
                                </span>
                                <button 
                                  onClick={() => handleGenerateToken(exam.id)}
                                  title="Generate Ulang Token"
                                  className="p-1 text-gray-600 hover:text-primary-blue bg-gray-100 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                                >
                                  <RotateCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className={`text-[10px] ${isExpired ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                                {isExpired ? 'Kadaluarsa: ' : 'Exp: '} 
                                {expDate.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                              {isExpired && (
                                <button 
                                  onClick={() => handleGenerateToken(exam.id)}
                                  className="mt-1 text-xs bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1 w-fit shadow-sm active:scale-95"
                                >
                                  <RotateCw className="w-3 h-3" /> Generate Ulang Token
                                </button>
                              )}
                            </div>
                          );
                        })() : (
                          <button 
                            onClick={() => handleGenerateToken(exam.id)}
                            className="text-xs bg-primary-blue text-white px-3 py-1.5 rounded-lg font-bold hover:bg-primary-blue-dark transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <RotateCw className="w-3.5 h-3.5" /> Buat Token
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  {exam.isLive && (
                    <Link href={`/admin/ujian/${exam.id}/live`} title="Live Monitor" className="p-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center shadow-md animate-pulse">
                      <Activity className="w-4 h-4" />
                    </Link>
                  )}
                  <Link href={`/admin/ujian/${exam.id}/hasil`} title="Lihat Rekap Kelas" className="p-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleExport(exam.id, exam.title)} 
                    title="Unduh Nilai Excel"
                    className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <DownloadCloud className="w-4 h-4" />
                  </button>
                  <Link href={`/admin/ujian/${exam.id}`} title="Kelola Soal" className="p-2 text-primary-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(exam.id)} title="Hapus Ujian" className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

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
