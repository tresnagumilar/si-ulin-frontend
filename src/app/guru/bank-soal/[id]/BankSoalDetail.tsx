'use client';
import { useState, useRef } from 'react';
import { Plus, Trash2, Pencil, Upload, FileSpreadsheet, Database, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getImageUrl } from '@/lib/image';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

type Question = {
  id: string;
  question_bank_id?: string | null;
  examId?: string | null;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string | null;
  answer: string;
  imageUrl?: string | null;
};

export default function BankSoalDetail({ bankId, initialQuestions, token }: { bankId: string, initialQuestions: Question[], token: string }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newQ, setNewQ] = useState({
    question_bank_id: bankId,
    content: '',
    optionA: '', optionB: '', optionC: '',
    optionD: '',
    optionE: '',
    answer: 'A',
    imageUrl: ''
  });

  const [editQ, setEditQ] = useState({
    content: '',
    optionA: '', optionB: '', optionC: '',
    optionD: '',
    optionE: '',
    answer: 'A',
    imageUrl: ''
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (isEditMode) {
          setEditQ(prev => ({ ...prev, imageUrl: data.url }));
        } else {
          setNewQ(prev => ({ ...prev, imageUrl: data.url }));
        }
      } else {
        alert('Gagal mengunggah gambar');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengunggah gambar');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newQ, question_bank_id: bankId, examId: null })
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions([...questions, data]);
        setIsModalOpen(false);
        setNewQ({ question_bank_id: bankId, content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', answer: 'A', imageUrl: '' });
      } else {
        alert(data.message || data.error || 'Gagal menambahkan soal');
      }
    } catch (error) {
      alert('Gagal menambah soal');
    }
    setIsLoading(false);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQ(q);
    setEditQ({
      content: q.content,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      optionE: q.optionE || '',
      answer: q.answer,
      imageUrl: q.imageUrl || ''
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQ) return;

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/questions/${editingQ.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editQ)
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(questions.map(q => q.id === editingQ.id ? data : q));
        setEditingQ(null);
      } else {
        showAlert(data.message || data.error || 'Gagal mengedit soal', 'Gagal', 'error');
      }
    } catch (error) {
      showAlert('Gagal mengedit soal', 'Error', 'error');
    }
    setIsLoading(false);
  };

  const handleDelete = (id: string) => {
    showConfirm('Apakah Anda yakin ingin menghapus soal ini dari Bank Soal?', async () => {
      setConfirmData({ ...confirmData, isOpen: false });
      try {
        const res = await fetch(`http://localhost:8000/api/questions/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setQuestions(questions.filter(q => q.id !== id));
        } else {
          showAlert('Gagal menghapus soal', 'Gagal', 'error');
        }
      } catch (error) {
        showAlert('Gagal menghapus soal karena kendala jaringan', 'Error', 'error');
      }
    });
  };

  // Smart answer key extractor
  const parseAnswerKey = (rawAns: string, optA: string, optB: string, optC: string, optD: string, optE?: string | null) => {
    if (!rawAns) return 'A';
    const cleanStr = rawAns.toString().trim();
    const upperStr = cleanStr.toUpperCase();

    if (['A', 'B', 'C', 'D', 'E'].includes(upperStr)) {
      return upperStr;
    }

    // Match text content against option text
    const lowStr = cleanStr.toLowerCase();
    if (optA && optA.trim().toLowerCase() === lowStr) return 'A';
    if (optB && optB.trim().toLowerCase() === lowStr) return 'B';
    if (optC && optC.trim().toLowerCase() === lowStr) return 'C';
    if (optD && optD.trim().toLowerCase() === lowStr) return 'D';
    if (optE && optE.trim().toLowerCase() === lowStr) return 'E';

    return 'A';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(sheet);

        const formattedQuestions = parsedData.map(row => {
          const content = row['Pertanyaan'] || row['Soal'] || row['Question'] || row['content'] || '';
          const optionA = row['Opsi A'] || row['Option A'] || row['Pilihan A'] || row['A'] || '';
          const optionB = row['Opsi B'] || row['Option B'] || row['Pilihan B'] || row['B'] || '';
          const optionC = row['Opsi C'] || row['Option C'] || row['Pilihan C'] || row['C'] || '';
          const optionD = row['Opsi D'] || row['Option D'] || row['Pilihan D'] || row['D'] || '';
          const optionE = row['Opsi E'] || row['Option E'] || row['Pilihan E'] || row['E'] || null;
          
          const rawAnswer = row['Jawaban'] || row['Kunci'] || row['Kunci Jawaban'] || row['Jawaban Benar'] || row['Answer'] || row['Key'] || '';
          const answer = parseAnswerKey(rawAnswer, optionA, optionB, optionC, optionD, optionE);
          const imageUrl = row['Gambar'] || row['Image'] || null;

          return {
            content: content.toString().trim(),
            optionA: optionA.toString().trim(),
            optionB: optionB.toString().trim(),
            optionC: optionC.toString().trim(),
            optionD: optionD.toString().trim(),
            optionE: optionE ? optionE.toString().trim() : null,
            answer,
            imageUrl: imageUrl ? imageUrl.toString().trim() : null
          };
        }).filter(q => q.content && q.optionA && q.optionB);

        if (formattedQuestions.length === 0) {
          showAlert('Format Excel tidak sesuai atau kosong. Pastikan kolom header mencakup: Pertanyaan, Opsi A, Opsi B, Opsi C, Opsi D, Jawaban (atau Kunci Jawaban)', 'Format Gagal', 'warning');
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        const res = await fetch(`http://localhost:8000/api/question-banks/${bankId}/questions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ questions: formattedQuestions })
        });

        const resData = await res.json();

        if (res.ok) {
          showAlert(`Berhasil mengimpor ${formattedQuestions.length} soal beserta kunci jawaban ke Bank Soal!`, 'Berhasil', 'success');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showAlert(resData.message || resData.error || 'Gagal mengimpor soal dari server', 'Gagal', 'error');
        }
      } catch (err) {
        showAlert('Terjadi kesalahan saat memproses file Excel.', 'Error', 'error');
        console.error(err);
      }
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    if (questions.length === 0) {
      showAlert('Tidak ada soal untuk diekspor.', 'Informasi', 'info');
      return;
    }

    const dataToExport = questions.map((q, idx) => ({
      'No': idx + 1,
      'Pertanyaan': q.content,
      'Opsi A': q.optionA,
      'Opsi B': q.optionB,
      'Opsi C': q.optionC,
      'Opsi D': q.optionD,
      'Opsi E': q.optionE || '',
      'Jawaban Benar': q.answer,
      'Gambar': q.imageUrl || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bank Soal');
    XLSX.writeFile(workbook, `Bank_Soal_Export_${bankId}.xlsx`);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No': 1,
        'Pertanyaan': 'Contoh pertanyaan pertama?',
        'Opsi A': 'Jawaban A',
        'Opsi B': 'Jawaban B',
        'Opsi C': 'Jawaban C',
        'Opsi D': 'Jawaban D',
        'Opsi E': 'Jawaban E',
        'Jawaban Benar': 'A',
        'Gambar': ''
      },
      {
        'No': 2,
        'Pertanyaan': 'Memecah masalah yang besar dan kompleks menjadi bagian-bagian yang lebih kecil disebut...',
        'Opsi A': 'Pengenalan Pola',
        'Opsi B': 'Dekomposisi',
        'Opsi C': 'Abstraksi',
        'Opsi D': 'Desain Algoritma',
        'Opsi E': 'Evaluasi',
        'Jawaban Benar': 'B',
        'Gambar': ''
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Soal');
    XLSX.writeFile(workbook, 'Template_Import_Soal_SMKN9.xlsx');
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-blue hover:bg-primary-blue-dark text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" /> Tambah Soal Manual
          </button>

          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md disabled:opacity-50 active:scale-95"
          >
            <FileSpreadsheet className="w-5 h-5" /> 
            {isLoading ? 'Memproses...' : 'Import Excel'}
          </button>

          {questions.length > 0 && (
            <button 
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md active:scale-95"
            >
              <Download className="w-5 h-5" /> Ekspor Excel
            </button>
          )}
        </div>

        <button 
          onClick={handleDownloadTemplate}
          className="text-sm text-gray-600 hover:text-primary-blue flex items-center gap-1 font-semibold underline decoration-dashed"
        >
          <FileSpreadsheet className="w-4 h-4 text-green-600" /> Unduh Template Excel
        </button>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary-blue mb-2">
              <Database className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Bank Soal Masih Kosong</h3>
              <p className="text-sm text-gray-500">Bank Soal ini belum memiliki soal. Mulai tambahkan soal secara manual atau dengan mengunggah berkas Excel.</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary-blue hover:bg-primary-blue-dark text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-5 h-5" /> Tambah Soal Manual
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50 active:scale-95"
              >
                <FileSpreadsheet className="w-5 h-5" /> 
                {isLoading ? 'Memproses...' : 'Import Berkas Excel'}
              </button>
            </div>
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleOpenEdit(q)} 
                  title="Edit Soal & Kunci Jawaban"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(q.id)} 
                  title="Hapus Soal"
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="pr-24 mb-4">
                {q.imageUrl && (
                  <div className="mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getImageUrl(q.imageUrl)} alt="Soal Image" className="max-w-md max-h-64 object-contain rounded-lg border border-gray-200" />
                  </div>
                )}
                <p className="text-lg font-semibold text-gray-800">{index + 1}. {q.content}</p>
              </div>

              <div className="ml-12 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {['A', 'B', 'C', 'D', 'E'].map(opt => {
                  const val = q[`option${opt}` as keyof Question];
                  if (!val) return null;
                  const isCorrect = q.answer === opt;
                  return (
                    <div key={opt} className={`p-3 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-300 font-semibold text-green-900 shadow-sm ring-1 ring-green-400/30' : 'bg-gray-50 border-gray-100'}`}>
                      <span className={`mr-2 ${isCorrect ? 'text-green-600 font-bold' : 'text-gray-500'}`}>{opt}.</span>
                      {val}
                      {isCorrect && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold">KUNCI</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah Soal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Tambah Soal Baru</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pertanyaan</label>
                <textarea 
                  value={newQ.content} 
                  onChange={e => setNewQ({...newQ, content: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all"
                  rows={3} required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gambar (Opsional)</label>
                {newQ.imageUrl && (
                  <div className="mb-2 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getImageUrl(newQ.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNewQ({...newQ, imageUrl: ''})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  disabled={isUploadingImage}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary-blue hover:file:bg-blue-100"
                />
                {isUploadingImage && <p className="text-xs text-gray-500 mt-1">Mengunggah gambar...</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi A</label>
                  <input type="text" required value={newQ.optionA} onChange={e => setNewQ({...newQ, optionA: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi B</label>
                  <input type="text" required value={newQ.optionB} onChange={e => setNewQ({...newQ, optionB: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi C</label>
                  <input type="text" required value={newQ.optionC} onChange={e => setNewQ({...newQ, optionC: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi D</label>
                  <input type="text" required value={newQ.optionD} onChange={e => setNewQ({...newQ, optionD: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi E (Opsional)</label>
                  <input type="text" value={newQ.optionE || ''} onChange={e => setNewQ({...newQ, optionE: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-bold text-green-700">Kunci Jawaban Benar</label>
                  <select required value={newQ.answer} onChange={e => setNewQ({...newQ, answer: e.target.value})} className="w-full px-4 py-2 border border-green-400 bg-green-50 font-bold rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl">Batal</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary-blue text-white font-bold rounded-xl hover:bg-primary-blue-dark disabled:opacity-50">
                  {isLoading ? 'Menyimpan...' : 'Simpan Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Soal */}
      {editingQ && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-blue-900 flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary-blue" /> Edit Soal & Kunci Jawaban
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pertanyaan</label>
                <textarea 
                  value={editQ.content} 
                  onChange={e => setEditQ({...editQ, content: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all"
                  rows={3} required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gambar (Opsional)</label>
                {editQ.imageUrl && (
                  <div className="mb-2 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getImageUrl(editQ.imageUrl)} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setEditQ({...editQ, imageUrl: ''})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  disabled={isUploadingImage}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary-blue hover:file:bg-blue-100"
                />
                {isUploadingImage && <p className="text-xs text-gray-500 mt-1">Mengunggah gambar...</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi A</label>
                  <input type="text" required value={editQ.optionA} onChange={e => setEditQ({...editQ, optionA: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi B</label>
                  <input type="text" required value={editQ.optionB} onChange={e => setEditQ({...editQ, optionB: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi C</label>
                  <input type="text" required value={editQ.optionC} onChange={e => setEditQ({...editQ, optionC: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi D</label>
                  <input type="text" required value={editQ.optionD} onChange={e => setEditQ({...editQ, optionD: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opsi E (Opsional)</label>
                  <input type="text" value={editQ.optionE || ''} onChange={e => setEditQ({...editQ, optionE: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-bold text-green-700">Kunci Jawaban Benar</label>
                  <select required value={editQ.answer} onChange={e => setEditQ({...editQ, answer: e.target.value})} className="w-full px-4 py-2 border border-green-400 bg-green-50 font-bold rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setEditingQ(null)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl">Batal</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary-blue text-white font-bold rounded-xl hover:bg-primary-blue-dark disabled:opacity-50">
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </>
  );
}
