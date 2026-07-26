'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Check, X, ShieldAlert } from 'lucide-react';

type PendingUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

export default function ApprovalClient() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.token) {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/pending-users', {
        headers: {
          'Authorization': `Bearer ${session?.user?.token}`,
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (id: string) => {
    if (!confirm('Setujui akun ini?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/approve-user/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const rejectUser = async (id: string) => {
    if (!confirm('Tolak dan hapus akun ini?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/reject-user/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.user?.token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-gray-500">Memuat data pendaftar...</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Menunggu Persetujuan</h2>
        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" /> {users.length} Antrean
        </span>
      </div>
      
      {users.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Tidak ada pendaftar baru yang menunggu persetujuan.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                <th className="p-4 font-semibold">Nama</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Peran</th>
                <th className="p-4 font-semibold">Waktu Daftar</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${u.role === 'GURU' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => approveUser(u.id)}
                      className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition-colors"
                      title="Setujui"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => rejectUser(u.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-lg transition-colors"
                      title="Tolak"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
