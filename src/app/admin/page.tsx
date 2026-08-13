import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import ApprovalClient from './ApprovalClient';
import OnlineUsersWidget from '@/components/OnlineUsersWidget';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function AdminDashboard() {
  const session = (await getServerSession(authOptions)) as any;
  
  if (!session || !session.user) redirect('/');
  if (session.user.role !== 'ADMIN') redirect('/dashboard/siswa');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-blue rounded-xl flex items-center justify-center text-white shadow-sm shadow-primary-blue/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dasbor Admin</h1>
          <p className="text-gray-500">Pusat persetujuan akun pendaftar baru.</p>
        </div>
      </div>
      <ApprovalClient />
      
      <OnlineUsersWidget />
    </div>
  );
}
