'use client';
import { useState, useRef } from 'react';
import { Plus, Trash2, Upload, FileSpreadsheet, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getImageUrl } from '@/lib/image';

type Question = {
  id: string;
  question_bank_id: string;
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
  const [isLoading, setIsLoading] = useState(false);
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setNewQ({ ...newQ, imageUrl: data.url });
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

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus soal ini dari Bank Soal?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/questions/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      }
    } catch (error) {
      alert('Gagal menghapus soal');
    }
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

        const formattedQuestions = parsedData.map(row => ({
          content: row['Pertanyaan']?.toString() || '',
          optionA: row['Opsi A']?.toString() || '',
          optionB: row['Opsi B']?.toString() || '',
          optionC: row['Opsi C']?.toString() || '',
          optionD: row['Opsi D']?.toString() || '',
          optionE: row['Opsi E']?.toString() || null,
          answer: row['Jawaban']?.toString()?.toUpperCase() || 'A',
          imageUrl: row['Gambar']?.toString() || null
        })).filter(q => q.content && q.optionA && q.optionB);

        if (formattedQuestions.length === 0) {
          alert('Format Excel tidak sesuai atau kosong. Pastikan kolom header bernama: Pertanyaan, Opsi A, Opsi B, Opsi C, Opsi D, Jawaban');
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
          alert(`Berhasil mengimpor ${formattedQuestions.length} soal ke Bank Soal!`);
          window.location.reload();
        } else {
          alert(resData.message || resData.error || 'Gagal mengimpor soal dari server');
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

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-4">
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
                <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="pr-16 mb-4">
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
                    <div key={opt} className={`p-3 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200 font-semibold' : 'bg-gray-50 border-gray-100'}`}>
                      <span className={`mr-2 ${isCorrect ? 'text-green-600' : 'text-gray-500'}`}>{opt}.</span>
                      {val}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

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
                  onChange={handleImageUpload}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jawaban Benar</label>
                  <select required value={newQ.answer} onChange={e => setNewQ({...newQ, answer: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none bg-white">
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
    </>
  );
}
