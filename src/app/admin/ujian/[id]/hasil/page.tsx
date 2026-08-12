import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { authOptions } from '../../../../api/auth/[...nextauth]/route';
import HasilUjianClient from '../../../../guru/ujian/[id]/hasil/HasilUjianClient';

export default async function AdminRekapHasilUjianPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') redirect('/');

  const { id } = await params;

  const res = await fetch(`http://127.0.0.1:8000/api/admin/exam/${id}/results`, {
    headers: { 'Authorization': `Bearer ${session.user.token}` },
    cache: 'no-store'
  });

  if (!res.ok) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <h2 className="text-xl font-bold text-gray-900">Ujian tidak ditemukan</h2>
        <Link href="/admin/ujian" className="text-primary-blue mt-4 inline-block">Kembali ke Daftar Ujian</Link>
      </div>
    );
  }

  const data = await res.json();
  const exam = data.exam;
  const attempts = data.attempts;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/ujian" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Ujian (Admin)
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rekap Hasil: {exam.title}</h1>
          <p className="text-gray-500">Mata Pelajaran: <span className="font-bold text-gray-700">{exam.subject}</span> | KKM: <span className="font-bold text-gray-700">{exam.passingScore}</span></p>
        </div>
      </div>

      <HasilUjianClient exam={exam} initialAttempts={attempts} />
    </div>
  );
}
