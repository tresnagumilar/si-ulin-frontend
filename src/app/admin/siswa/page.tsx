import { Users, Search, Trash2 } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import DataSiswaClient from './DataSiswaClient';

export default async function DataSiswaAdminPage() {
  const session = (await getServerSession(authOptions)) as any;
  
  if (!session || !session.user) redirect('/');
  if (session.user.role !== 'ADMIN') redirect('/dashboard/siswa');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-blue rounded-xl flex items-center justify-center text-white shadow-sm shadow-primary-blue/30">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Data Pengguna</h1>
          <p className="text-gray-500">Kelola data siswa dan guru yang telah disetujui.</p>
        </div>
      </div>
      
      <DataSiswaClient token={session.user.token!} />
    </div>
  );
}
