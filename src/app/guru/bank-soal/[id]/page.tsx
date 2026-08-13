import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import BankSoalDetail from './BankSoalDetail';
import Link from 'next/link';
import { ArrowLeft, Database } from 'lucide-react';

export default async function DetailBankSoalPage({ params }: { params: Promise<{ id: string }> }) {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user || (session.user as any).role !== 'GURU') redirect('/');
  const token = (session.user as any).token;

  const { id } = await params;

  // Fetch Bank Soal data
  const res = await fetch(`http://127.0.0.1:8000/api/question-banks/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!res.ok) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800">Bank Soal tidak ditemukan</h2>
        <Link href="/guru/bank-soal" className="text-primary-blue hover:underline mt-4 inline-block">Kembali ke Daftar</Link>
      </div>
    );
  }

  const bank = await res.json();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <Link href="/guru/bank-soal" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-blue transition-colors font-medium mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Bank Soal
      </Link>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-primary-blue rounded-2xl flex items-center justify-center shrink-0">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{bank.title}</h1>
            <p className="text-gray-500 font-medium">{bank.subject} • {bank.questions?.length || 0} Soal</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Kelola Soal</h2>
        <BankSoalDetail bankId={bank.id} initialQuestions={bank.questions || []} token={token} />
      </div>
    </div>
  );
}
