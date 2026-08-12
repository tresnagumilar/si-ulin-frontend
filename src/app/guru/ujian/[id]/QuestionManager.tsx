'use client';
import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Pencil, Upload, FileSpreadsheet, Database, Download, Search, CheckSquare, Square } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getImageUrl } from '@/lib/image';

import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

type Question = {
  id: string;
  examId?: string | null;
  question_bank_id?: string | null;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string | null;
  answer: string;
  imageUrl?: string | null;
  type?: 'PG' | 'ESSAY';
  essay_answer_key?: string | null;
};

export default function QuestionManager({ examId, initialQuestions, token }: { examId: string, initialQuestions: Question[], token: string }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom Modals State
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

  // Bank Soal State
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
  const [isFetchingBank, setIsFetchingBank] = useState(false);

  useEffect(() => {
    if (isBankModalOpen && banks.length === 0) {
      fetch('http://localhost:8000/api/question-banks', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setBanks(data);
        if (data.length > 0) {
          setSelectedBank(data[0].id);
        }
      })
      .catch(console.error);
    }
  }, [isBankModalOpen]);

  useEffect(() => {
    if (selectedBank) {
      setIsFetchingBank(true);
      fetch(`http://localhost:8000/api/question-banks/${selectedBank}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setBankQuestions(data.questions || []);
        setSelectedQIds([]);
      })
      .catch(console.error)
      .finally(() => setIsFetchingBank(false));
    }
  }, [selectedBank]);

  const handlePullSelectedFromBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQIds.length === 0) {
      showAlert('Pilih minimal 1 soal untuk ditarik dari Bank Soal.', 'Peringatan', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/exams/${examId}/import-selected-from-bank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_ids: selectedQIds
        })
      });
      if (res.ok) {
        showAlert(`Berhasil menarik ${selectedQIds.length} soal terpilih dari Bank Soal!`, 'Berhasil', 'success');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        const err = await res.json();
        showAlert(err.error || 'Gagal menarik soal', 'Gagal', 'error');
      }
    } catch (err) {
      showAlert('Terjadi kesalahan jaringan saat menarik soal.', 'Error', 'error');
    }
    setIsLoading(false);
  };

  const toggleSelectQuestion = (id: string) => {
    if (selectedQIds.includes(id)) {
      setSelectedQIds(selectedQIds.filter(qId => qId !== id));
    } else {
      setSelectedQIds([...selectedQIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedQIds.length === filteredBankQuestions.length) {
      setSelectedQIds([]);
    } else {
      setSelectedQIds(filteredBankQuestions.map(q => q.id));
    }
  };

  const filteredBankQuestions = bankQuestions.filter(q => 
    q.content.toLowerCase().includes(bankSearch.toLowerCase())
  );
  
  const [newQ, setNewQ] = useState({
    examId,
    type: 'PG' as 'PG' | 'ESSAY',
    content: '',
    optionA: '', optionB: '', optionC: '',
    optionD: '',
    optionE: '',
    answer: 'A',
    essay_answer_key: '',
    imageUrl: ''
  });

  const [editQ, setEditQ] = useState({
    type: 'PG' as 'PG' | 'ESSAY',
    content: '',
    optionA: '', optionB: '', optionC: '',
    optionD: '',
    optionE: '',
    answer: 'A',
    essay_answer_key: '',
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
        showAlert('Gagal mengunggah gambar', 'Upload Gagal', 'error');
      }
    } catch (error) {
      console.error(error);
      showAlert('Terjadi kesalahan saat mengunggah gambar', 'Error Upload', 'error');
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
        body: JSON.stringify(newQ)
      });
      if (res.ok) {
        const created = await res.json();
        setQuestions([...questions, created]);
        setIsModalOpen(false);
        setNewQ({ examId, type: 'PG', content: '', optionA: '', optionB: '', optionC: '', optionD: '', optionE: '', answer: 'A', essay_answer_key: '', imageUrl: '' });
      } else {
        showAlert('Gagal menambahkan soal baru.', 'Gagal Simpan', 'error');
      }
    } catch (error) {
      showAlert('Gagal menambah soal karena masalah koneksi.', 'Error', 'error');
    }
    setIsLoading(false);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQ(q);
    setEditQ({
      type: q.type || 'PG',
      content: q.content,
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      optionE: q.optionE || '',
      answer: q.answer || 'A',
      essay_answer_key: q.essay_answer_key || '',
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
        showAlert(data.message || data.error || 'Gagal mengedit soal', 'Gagal Edit', 'error');
      }
    } catch (error) {
      showAlert('Gagal mengedit soal', 'Error', 'error');
    }
    setIsLoading(false);
  };

  const handleDelete = (id: string) => {
    showConfirm('Apakah Anda yakin ingin menghapus butir soal ini dari ujian?', async () => {
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
        showAlert('Gagal menghapus soal karena masalah koneksi', 'Error', 'error');
      }
    });
  };

  const parseAnswerKey = (rawAns: string, optA: string, optB: string, optC: string, optD: string, optE?: string | null) => {
    if (!rawAns) return 'A';
    const cleanStr = rawAns.toString().trim();
    const upperStr = cleanStr.toUpperCase();
    if (['A', 'B', 'C', 'D', 'E'].includes(upperStr)) return upperStr;
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
          const qType = (row['Tipe'] || row['Jenis'] || 'PG').toString().toUpperCase().includes('ES') ? 'ESSAY' : 'PG';
          const optionA = row['Opsi A'] || row['Option A'] || row['Pilihan A'] || row['A'] || '';
          const optionB = row['Opsi B'] || row['Option B'] || row['Pilihan B'] || row['B'] || '';
          const optionC = row['Opsi C'] || row['Option C'] || row['Pilihan C'] || row['C'] || '';
          const optionD = row['Opsi D'] || row['Option D'] || row['Pilihan D'] || row['D'] || '';
          const optionE = row['Opsi E'] || row['Option E'] || row['Pilihan E'] || row['E'] || null;
          const rawAnswer = row['Jawaban'] || row['Kunci'] || row['Kunci Jawaban'] || row['Jawaban Benar'] || '';
          const answer = qType === 'PG' ? parseAnswerKey(rawAnswer, optionA, optionB, optionC, optionD, optionE) : 'ESSAY';
          const essayKey = qType === 'ESSAY' ? rawAnswer.toString() : null;
          const imageUrl = row['Gambar'] || row['Image'] || null;

          return {
            content: content.toString().trim(),
            type: qType,
            optionA: optionA.toString().trim(),
            optionB: optionB.toString().trim(),
            optionC: optionC.toString().trim(),
            optionD: optionD.toString().trim(),
            optionE: optionE ? optionE.toString().trim() : null,
            answer,
            essay_answer_key: essayKey,
            imageUrl: imageUrl ? imageUrl.toString().trim() : null
          };
        }).filter(q => q.content);

        if (formattedQuestions.length === 0) {
          alert('Format Excel kosong atau tidak sesuai.');
          setIsLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        const res = await fetch('http://localhost:8000/api/questions/bulk', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ examId, questions: formattedQuestions })
        });

        if (res.ok) {
          alert(`Berhasil mengimpor ${formattedQuestions.length} soal!`);
          window.location.reload();
        } else {
          alert('Gagal mengimpor soal dari server');
        }
      } catch (err) {
        alert('Terjadi kesalahan saat memproses file Excel.');
        console.error(err);
      }
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    if (questions.length === 0) {
      alert('Tidak ada soal untuk diekspor.');
      return;
    }

    const dataToExport = questions.map((q, idx) => ({
      'No': idx + 1,
      'Tipe Soal': q.type || 'PG',
      'Pertanyaan': q.content,
      'Opsi A': q.optionA,
      'Opsi B': q.optionB,
      'Opsi C': q.optionC,
      'Opsi D': q.optionD,
      'Opsi E': q.optionE || '',
      'Jawaban Benar': q.type === 'ESSAY' ? (q.essay_answer_key || '') : q.answer,
      'Gambar': q.imageUrl || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Soal Ujian');
    XLSX.writeFile(workbook, `Soal_Ujian_Export_${examId}.xlsx`);
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

          <button 
            onClick={() => setIsBankModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md active:scale-95"
          >
            <Database className="w-5 h-5" /> Tarik dari Bank Soal
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-dashed border-gray-300">
            Belum ada soal untuk ujian ini. Silakan tambah soal baru atau impor file Excel.
          </div>
        ) : (
          questions.map((q, index) => (
            <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="absolute top-4 right-4 flex gap-2 items-center">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${q.type === 'ESSAY' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {q.type === 'ESSAY' ? 'Esai' : 'Pilihan Ganda'}
                </span>
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
              
              <div className="pr-32 mb-4">
                {q.imageUrl && (
                  <div className="mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getImageUrl(q.imageUrl)} alt="Soal Image" className="max-w-md max-h-64 object-contain rounded-lg border border-gray-200" />
                  </div>
                )}
                <p className="text-lg font-semibold text-gray-800">{index + 1}. {q.content}</p>
              </div>

              {q.type === 'ESSAY' ? (
                <div className="ml-6 p-4 bg-purple-50/60 border border-purple-100 rounded-xl">
                  <p className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">Kunci Jawaban Esai (Pegangan Guru):</p>
                  <p className="text-sm text-gray-800 italic">{q.essay_answer_key || 'Belum diisi'}</p>
                </div>
              ) : (
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
              )}
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Soal</label>
                <select 
                  value={newQ.type}
                  onChange={e => setNewQ({...newQ, type: e.target.value as 'PG' | 'ESSAY'})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-primary-blue bg-blue-50 focus:ring-2 focus:ring-primary-blue outline-none"
                >
                  <option value="PG">Pilihan Ganda</option>
                  <option value="ESSAY">Esai (Uraian)</option>
                </select>
              </div>

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

              {newQ.type === 'ESSAY' ? (
                <div>
                  <label className="block text-sm font-bold text-purple-800 mb-1">Kunci Jawaban / Pedoman Penilaian Esai</label>
                  <textarea 
                    value={newQ.essay_answer_key} 
                    onChange={e => setNewQ({...newQ, essay_answer_key: e.target.value})}
                    placeholder="Masukkan poin-poin kunci jawaban esai untuk pedoman penilaian guru..."
                    className="w-full px-4 py-3 rounded-xl border border-purple-200 bg-purple-50/50 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    rows={3}
                  />
                </div>
              ) : (
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
              )}

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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Soal</label>
                <select 
                  value={editQ.type}
                  onChange={e => setEditQ({...editQ, type: e.target.value as 'PG' | 'ESSAY'})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-primary-blue bg-blue-50 focus:ring-2 focus:ring-primary-blue outline-none"
                >
                  <option value="PG">Pilihan Ganda</option>
                  <option value="ESSAY">Esai (Uraian)</option>
                </select>
              </div>

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

              {editQ.type === 'ESSAY' ? (
                <div>
                  <label className="block text-sm font-bold text-purple-800 mb-1">Kunci Jawaban / Pedoman Penilaian Esai</label>
                  <textarea 
                    value={editQ.essay_answer_key} 
                    onChange={e => setEditQ({...editQ, essay_answer_key: e.target.value})}
                    placeholder="Masukkan poin-poin kunci jawaban esai untuk pedoman penilaian guru..."
                    className="w-full px-4 py-3 rounded-xl border border-purple-200 bg-purple-50/50 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    rows={3}
                  />
                </div>
              ) : (
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
              )}

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

      {/* Modal Tarik dari Bank Soal (Checkbox Selection) */}
      {isBankModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <Database className="w-6 h-6 text-purple-600" /> Tarik Soal Spesifik dari Bank Soal
            </h3>
            
            {banks.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                Anda belum memiliki Bank Soal. Silakan buat di menu Bank Soal.
                <div className="mt-6">
                  <button onClick={() => setIsBankModalOpen(false)} className="px-4 py-2 bg-gray-100 font-bold rounded-xl text-gray-600">Tutup</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePullSelectedFromBank} className="flex flex-col flex-1 overflow-hidden space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Pilih Bank Soal</label>
                    <select 
                      value={selectedBank} 
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none text-sm"
                      required
                    >
                      {banks.map(b => (
                        <option key={b.id} value={b.id}>{b.title} ({b.questions_count} Soal)</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Cari Soal</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" placeholder="Filter teks pertanyaan..."
                        value={bankSearch} onChange={e => setBankSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center px-1 pt-2 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={toggleSelectAll}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
                  >
                    {selectedQIds.length > 0 && selectedQIds.length === filteredBankQuestions.length ? (
                      <CheckSquare className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                    Pilih Semua ({filteredBankQuestions.length} Soal)
                  </button>
                  <span className="text-xs font-semibold text-gray-500">
                    Terpilih: <strong className="text-purple-700">{selectedQIds.length}</strong> Soal
                  </span>
                </div>

                {/* Question List Checkboxes */}
                <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50/50">
                  {isFetchingBank ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Memuat daftar soal...</div>
                  ) : filteredBankQuestions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Tidak ada soal yang ditemukan di bank ini.</div>
                  ) : (
                    filteredBankQuestions.map((q, idx) => {
                      const isSelected = selectedQIds.includes(q.id);
                      return (
                        <div 
                          key={q.id}
                          onClick={() => toggleSelectQuestion(q.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected ? 'bg-purple-50 border-purple-300 shadow-sm' : 'bg-white border-gray-200 hover:border-purple-200'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by div onClick
                            className="mt-1 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          />
                          <div className="flex-1 text-sm">
                            <span className="font-bold text-gray-500 mr-2">{idx + 1}.</span>
                            <span className="font-medium text-gray-900">{q.content}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsBankModalOpen(false)} className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl">Batal</button>
                  <button 
                    type="submit" 
                    disabled={isLoading || selectedQIds.length === 0} 
                    className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
                  >
                    {isLoading ? 'Menarik...' : `Tarik ${selectedQIds.length} Soal Terpilih`}
                  </button>
                </div>
              </form>
            )}
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
