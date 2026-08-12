import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Activity, ShieldAlert } from 'lucide-react';
import QuestionManager from './QuestionManager';
import { authOptions } from '../../../api/auth/[...nextauth]/route';

export default async function GuruUjianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) redirect('/');
  if (session.user.role !== 'GURU' && session.user.role !== 'ADMIN') redirect('/dashboard/siswa');

  const res = await fetch(`http://localhost:8000/api/exams/${resolvedParams.id}`, {
    headers: {
      'Authorization': `Bearer ${session.user.token}`
    },
    cache: 'no-store'
  });

  const backLink = session.user.role === 'ADMIN' ? '/admin/ujian' : '/guru/ujian';

  if (!res.ok) redirect(backLink);

  const exam = await res.json();
  const currentUserId = (session.user as any).id;
  const isOwnerOrAdmin = session.user.role === 'ADMIN' || exam.teacher_id === currentUserId;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href={backLink} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
          <p className="text-sm text-gray-500">Mata Pelajaran: {exam.subject}</p>
        </div>
      </div>

      {!isOwnerOrAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 text-amber-900">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-lg">Mode Pengawas (Proctoring Mode)</h3>
            <p className="text-sm text-amber-800 mt-1">
              Anda sedang membuka ujian buatan guru lain ({exam.teacher?.name || 'Guru Pengampu'}). Anda tidak memiliki akses untuk mengubah soal atau rekap nilai, namun Anda dapat mengawasi jalannya ujian secara real-time.
            </p>
            <div className="mt-4">
              <Link 
                href={`/guru/ujian/${exam.id}/live`}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold inline-flex items-center gap-2 transition-all shadow-md active:scale-95 animate-pulse"
              >
                <Activity className="w-5 h-5" /> Awasi Ujian (Live Monitor)
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-primary-blue bg-blue-50 px-2 py-1 rounded-md uppercase border border-blue-100 mb-2 inline-block">
              {exam.subject}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{exam.title}</h1>
            <p className="text-gray-500 text-sm">Durasi: {exam.durationMin} Menit • Total Soal: {exam.totalQuestions}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
              exam.isLive 
              ? 'bg-red-50 text-red-600 border-red-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              {exam.isLive ? '🔴 LIVE' : '⚪ DRAFT'}
            </span>

            {isOwnerOrAdmin && exam.isLive && (
              <Link 
                href={session.user.role === 'ADMIN' ? `/admin/ujian/${exam.id}/live` : `/guru/ujian/${exam.id}/live`}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Activity className="w-4 h-4" /> Live Monitor
              </Link>
            )}
          </div>
        </div>
      </div>

      {isOwnerOrAdmin ? (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Manajemen Soal</h2>
            <p className="text-gray-500 text-sm">Tambah, edit, atau hapus butir soal untuk ujian ini.</p>
          </div>
          <QuestionManager examId={exam.id} initialQuestions={exam.questions} token={session.user.token!} />
        </>
      ) : null}
    </div>
  );
}
