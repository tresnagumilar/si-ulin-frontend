'use client';
import { useState } from 'react';
import { CheckCircle2, Clock, Calculator, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMin: number;
  isRemedial?: boolean;
}

interface CategoryFilterExamsProps {
  subjects: string[];
  liveExams: Exam[];
}

export default function CategoryFilterExams({ subjects, liveExams }: CategoryFilterExamsProps) {
  const [selectedSubject, setSelectedSubject] = useState('Semua');

  const filteredExams = liveExams.filter(exam => {
    if (selectedSubject === 'Semua') return true;
    return exam.subject.toLowerCase().includes(selectedSubject.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Categories Horizontal Scroll */}
      <div className="overflow-x-auto hide-scrollbar relative z-10 flex gap-3 pb-2 -mx-2 px-2">
        {subjects.map((sub) => {
          const isActive = selectedSubject === sub;
          return (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-white text-primary-blue-dark shadow-lg ring-2 ring-white/50'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* Active Exams Section */}
      <div className="bg-gray-50/50 rounded-3xl pt-2">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-blue" />
            Ujian Aktif {selectedSubject !== 'Semua' && <span className="text-sm font-normal text-gray-500">({selectedSubject})</span>}
          </h3>
          <Link href="/dashboard/siswa/ujian" className="text-xs font-semibold text-primary-blue hover:text-primary-blue-dark flex items-center">
            Lihat Semua <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="space-y-4">
          {filteredExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Tidak ada ujian aktif</h4>
              <p className="text-xs text-gray-500">
                {selectedSubject === 'Semua' 
                  ? 'Saat ini belum ada ujian yang bisa Anda kerjakan.'
                  : `Tidak ada ujian aktif untuk kategori ${selectedSubject}.`}
              </p>
            </div>
          ) : (
            filteredExams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary-blue flex items-center justify-center shrink-0 border border-blue-100">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-primary-blue tracking-wider uppercase">{exam.subject}</span>
                      {exam.isRemedial ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                          REMEDIAL
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 leading-tight">{exam.title}</h4>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1 pt-4 border-t border-gray-50">
                  <div className="flex gap-4">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {exam.durationMin} menit
                    </span>
                  </div>
                  <Link href={`/ujian/${exam.id}`} className="bg-primary-blue hover:bg-primary-blue-light text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-primary-blue/20 flex items-center gap-1.5 transition-all active:scale-95">
                    Masuk <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
