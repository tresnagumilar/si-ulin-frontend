import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../../api/auth/[...nextauth]/route';
import LiveMonitorClient from '../../../../guru/ujian/[id]/live/LiveMonitorClient';
import Link from 'next/link';
import { ArrowLeft, Activity } from 'lucide-react';

export default async function AdminLiveMonitorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = (await getServerSession(authOptions)) as any;
  
  if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
    redirect('/');
  }

  const token = (session.user as any).token;
  const { id } = await params;

  const res = await fetch(`http://127.0.0.1:8000/api/exams/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!res.ok) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800">Ujian tidak ditemukan</h2>
        <Link href="/admin/ujian" className="text-primary-blue hover:underline mt-4 inline-block">Kembali ke Daftar Ujian (Admin)</Link>
      </div>
    );
  }

  const exam = await res.json();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Link href="/admin/ujian" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-blue transition-colors font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Ujian (Admin)
      </Link>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Live Monitor: {exam.title}</h1>
            <p className="text-gray-500 font-medium">{exam.subject} • Pengawasan Real-Time (Admin)</p>
          </div>
        </div>
      </div>

      <LiveMonitorClient examId={exam.id} token={token} />
    </div>
  );
}
