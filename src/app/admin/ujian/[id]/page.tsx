import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QuestionManager from '../../../guru/ujian/[id]/QuestionManager';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { API_URL } from '@/lib/api';

export default async function AdminUjianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = (await getServerSession(authOptions)) as any;
  
  if (!session || !session.user || session.user.role !== 'ADMIN') redirect('/');

  const res = await fetch(`${API_URL}/api/exams/${resolvedParams.id}`, {
    headers: {
      'Authorization': `Bearer ${session.user.token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) redirect('/admin/ujian');

  const exam = await res.json();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/ujian" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title} (Admin View)</h1>
          <p className="text-sm text-gray-500">Mata Pelajaran: {exam.subject}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-primary-blue bg-blue-50 px-2 py-1 rounded-md uppercase border border-blue-100 mb-2 inline-block">
              {exam.subject}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{exam.title}</h1>
            <p className="text-gray-500 text-sm">Durasi: {exam.durationMin} Menit • Total Soal: {exam.totalQuestions}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
            exam.isLive 
            ? 'bg-red-50 text-red-600 border-red-200' 
            : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {exam.isLive ? '🔴 LIVE' : '⚪ DRAFT'}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Manajemen Soal</h2>
        <p className="text-gray-500 text-sm">Tambah, edit, atau hapus butir soal untuk ujian ini.</p>
      </div>

      <QuestionManager examId={exam.id} initialQuestions={exam.questions} token={session.user.token!} />
    </div>
  );
}
