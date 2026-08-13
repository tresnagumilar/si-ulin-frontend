import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Users, GraduationCap } from 'lucide-react';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { API_URL } from '@/lib/api';

export default async function DataSiswaPage() {
  const session = (await getServerSession(authOptions)) as any;
  
  if (!session || !session.user || (session.user as any).role !== 'GURU') {
    redirect('/');
  }

  const res = await fetch(`${API_URL}/api/guru/students`, {
    headers: {
      'Authorization': `Bearer ${(session.user as any).token}`,
    },
    cache: 'no-store'
  });
  
  const students = res.ok ? await res.json() : [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Siswa</h1>
          <p className="text-gray-500">Melihat daftar siswa terdaftar dan rekap nilai mereka.</p>
        </div>
        <div className="bg-primary-blue/10 text-primary-blue px-4 py-2 rounded-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          {students.length} Siswa Terdaftar
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kelas & Jurusan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Riwayat Ujian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    Belum ada siswa yang mendaftar atau disetujui.
                  </td>
                </tr>
              ) : (
                students.map((student: any) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {student.kelas ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.kelas} {student.jurusan}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                          Belum Pilih Kelas
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.exam_attempts && student.exam_attempts.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {student.exam_attempts.map((attempt: any) => (
                            <div key={attempt.id} className="text-sm bg-gray-50 border border-gray-100 p-2 rounded-lg flex justify-between items-center">
                              <span className="font-medium text-gray-700">{attempt.exam?.title || 'Ujian Tidak Diketahui'}</span>
                              <span className="font-bold text-primary-blue">{attempt.score} / 100</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Belum mengikuti ujian</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
