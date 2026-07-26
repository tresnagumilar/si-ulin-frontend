'use client';
import { useState } from 'react';
import { Plus, Settings, Eye, Trash2, Edit, DownloadCloud, Activity } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

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
};

export default function AdminExamListClient({ initialExams, token }: { initialExams: ExamData[], token: string }) {
  const [exams, setExams] = useState(initialExams);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', subject: '', durationMin: 60, passingScore: 70, allowRemedial: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/exams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newExam)
      });
      if (res.ok) {
        const created = await res.json();
        setExams([{...created, questions_count: 0, attempts_count: 0 }, ...exams]);
        setIsModalOpen(false);
        setNewExam({ title: '', subject: '', durationMin: 60, passingScore: 70, allowRemedial: false });
      }
    } catch (error) {
      alert('Gagal membuat ujian');
    }
    setIsLoading(false);
  };

  const toggleLive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/exams/${id}/live`, {
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
      const res = await fetch(`http://127.0.0.1:8000/api/exams/${id}/generate-token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExams(exams.map(e => e.id === id ? { ...e, exam_token: data.token, token_expires_at: data.expires_at } : e));
      } else {
        alert('Gagal generate token');
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus ujian ini secara permanen?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/exams/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setExams(exams.filter(e => e.id !== id));
      }
    } catch (error) {
      alert('Gagal menghapus');
    }
  };

  const handleExport = async (examId: string, examTitle: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/exam/${examId}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal mengambil data nilai');
      const attempts = await res.json();
      
      if (attempts.length === 0) {
        alert('Belum ada siswa yang mengerjakan ujian ini.');
        return;
      }

      // Format data for Excel
      const dataToExport = attempts.attempts.map((attempt: any, index: number) => ({
        'No': index + 1,
        'Nama Siswa': attempt.user.name,
        'Kelas': attempt.user.kelas,
        'Jurusan': attempt.user.jurusan,
        'Waktu Selesai': new Date(attempt.finishedAt).toLocaleString('id-ID'),
        'Nilai Akhir': attempt.score
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai');
      
      XLSX.writeFile(workbook, `Nilai_${examTitle.replace(/\s+/g, '_')}.xlsx`);
    } catch (err) {
      alert('Gagal mengekspor data ke Excel');
    }
  };

  return (
    <>
      <div className="mb-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-blue hover:bg-primary-blue-dark text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" /> Buat Ujian Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Judul Ujian</th>
              <th className="px-6 py-4 font-semibold">Mata Pelajaran</th>
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
                    <span className="text-xs font-bold bg-blue-50 text-primary-blue px-2 py-1 rounded border border-blue-100 uppercase">
                      {exam.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm"><span className="font-semibold">{exam.questions_count || 0}</span> Soal Tersimpan</p>
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
                          {exam.exam_token ? (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Token Ujian:</span>
                              <span className="font-mono font-bold text-primary-blue-dark tracking-wider text-sm bg-blue-50 px-2 py-1 rounded border border-blue-100">{exam.exam_token}</span>
                              <span className="text-[10px] text-gray-400 mt-0.5">
                                Exp: {new Date(exam.token_expires_at!).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleGenerateToken(exam.id)}
                              className="text-xs bg-primary-blue text-white px-2 py-1 rounded font-bold hover:bg-primary-blue-dark transition-colors"
                            >
                              Buat Token
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    {exam.isLive && (
                      <Link href={`/guru/ujian/${exam.id}/live`} title="Live Monitor" className="p-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center shadow-md animate-pulse">
                        <Activity className="w-4 h-4" />
                      </Link>
                    )}
                    <Link href={`/guru/ujian/${exam.id}/hasil`} title="Lihat Rekap Kelas" className="p-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleExport(exam.id, exam.title)} 
                      title="Unduh Nilai Excel"
                      className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <DownloadCloud className="w-4 h-4" />
                    </button>
                    <Link href={`/guru/ujian/${exam.id}`} title="Kelola Soal" className="p-2 text-primary-blue bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
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
      </div>

      {/* Modal Buat Ujian */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Buat Ujian Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Ujian</label>
                <input 
                  type="text" 
                  required
                  value={newExam.title}
                  onChange={e => setNewExam({...newExam, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                  placeholder="Misal: Ujian Tengah Semester"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                <input 
                  type="text" 
                  required
                  value={newExam.subject}
                  onChange={e => setNewExam({...newExam, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                  placeholder="Misal: Matematika"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (Menit)</label>
                <input 
                  type="number" 
                  required min={1}
                  value={newExam.durationMin}
                  onChange={e => setNewExam({...newExam, durationMin: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KKM (Nilai Lulus)</label>
                  <input 
                    type="number" 
                    required min={0} max={100}
                    value={newExam.passingScore}
                    onChange={e => setNewExam({...newExam, passingScore: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newExam.allowRemedial}
                      onChange={e => setNewExam({...newExam, allowRemedial: e.target.checked})}
                      className="w-5 h-5 text-primary-blue rounded border-gray-300 focus:ring-primary-blue"
                    />
                    <span className="text-sm font-medium text-gray-700">Otomatis Remedial</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl">Batal</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary-blue text-white font-bold rounded-xl hover:bg-primary-blue-dark disabled:opacity-50">
                  {isLoading ? 'Menyimpan...' : 'Buat Ujian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
