import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import BankSoalList from './BankSoalList';
import { Database } from 'lucide-react';

export default async function BankSoalPage() {
  const session = (await getServerSession(authOptions)) as any;
  
  if (!session || !session.user || (session.user as any).role !== 'GURU') {
    redirect('/');
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Soal Sentral</h1>
          <p className="text-gray-500">Kelola dan simpan kumpulan soal yang dapat digunakan ulang untuk berbagai ujian.</p>
        </div>
        <div className="bg-primary-blue/10 p-3 rounded-xl">
          <Database className="w-8 h-8 text-primary-blue" />
        </div>
      </div>
      <BankSoalList token={(session.user as any).token} />
    </div>
  );
}
