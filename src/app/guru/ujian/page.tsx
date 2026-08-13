import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Settings, Eye, Trash2 } from 'lucide-react';
import AdminExamListClient from './AdminExamListClient';
import { authOptions } from '../../api/auth/[...nextauth]/route';

export default async function GuruUjianPage() {
  const session = (await getServerSession(authOptions)) as any;
  if (!session || !session.user?.email) redirect('/');

  if (!session || !session.user || session.user.role !== 'GURU') redirect('/');

  const res = await fetch('http://127.0.0.1:8000/api/exams', {
    headers: {
      'Authorization': `Bearer ${session.user.token}`,
    },
    cache: 'no-store'
  });
  
  const exams = res.ok ? await res.json() : [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ujian Siswa</h1>
          <p className="text-gray-500">Manajemen daftar ujian, soal, dan status *Live* untuk siswa.</p>
        </div>
      </div>

      <AdminExamListClient initialExams={exams} token={session.user.token!} />
    </div>
  );
}
