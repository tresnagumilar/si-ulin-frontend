'use client';
import { useState, useEffect } from 'react';
import { Search, Trash2, User, UserCheck, Key, X, Lock, Unlock, Pencil } from 'lucide-react';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

export default function DataSiswaClient({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  // Edit User State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'SISWA',
    kelas: '',
    jurusan: '',
    subject: ''
  });

  // Custom Alert & Confirm Modals
  const [alertData, setAlertData] = useState<{ isOpen: boolean; title?: string; message: string; type?: 'error' | 'warning' | 'info' | 'success' }>({
    isOpen: false, message: ''
  });
  const [confirmData, setConfirmData] = useState<{ isOpen: boolean; title?: string; message: string; onConfirm: () => void }>({
    isOpen: false, message: '', onConfirm: () => {}
  });

  const showAlert = (message: string, title = 'Pemberitahuan', type: 'error' | 'warning' | 'info' | 'success' = 'warning') => {
    setAlertData({ isOpen: true, title, message, type });
  };

  const showConfirm = (message: string, onConfirm: () => void, title = 'Konfirmasi Tindakan') => {
    setConfirmData({ isOpen: true, title, message, onConfirm });
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id: number) => {
    showConfirm('Apakah Anda yakin ingin menghapus pengguna ini secara permanen?', async () => {
      setConfirmData({ ...confirmData, isOpen: false });
      try {
        const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          fetchUsers();
          showAlert('Pengguna berhasil dihapus.', 'Berhasil', 'success');
        } else {
          showAlert('Gagal menghapus pengguna.', 'Error', 'error');
        }
      } catch (error) {
        console.error(error);
        showAlert('Gagal menghapus pengguna karena kendala jaringan.', 'Error', 'error');
      }
    }, 'Hapus Pengguna');
  };

  const handleToggleQuestionAccess = async (teacherId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/teachers/${teacherId}/toggle-question-access`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
      } else {
        showAlert('Gagal mengubah izin akses membuat soal', 'Gagal', 'error');
      }
    } catch (error) {
      console.error(error);
      showAlert('Terjadi kesalahan jaringan', 'Error', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showAlert('Password minimal terdiri dari 6 karakter', 'Validasi Gagal', 'warning');
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${selectedUserForPassword.id}/password`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        showAlert('Password berhasil diubah', 'Berhasil', 'success');
        setPasswordModalOpen(false);
        setNewPassword('');
        setSelectedUserForPassword(null);
      } else {
        showAlert('Gagal mengubah password', 'Gagal', 'error');
      }
    } catch (error) {
      console.error(error);
      showAlert('Terjadi kesalahan jaringan', 'Error', 'error');
    }
  };

  const handleOpenEditModal = (user: any) => {
    setSelectedUserForEdit(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'SISWA',
      kelas: user.kelas || '',
      jurusan: user.jurusan || '',
      subject: user.subject || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${selectedUserForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        showAlert('Data pengguna berhasil diperbarui!', 'Berhasil', 'success');
        setEditModalOpen(false);
        fetchUsers();
      } else {
        showAlert('Gagal memperbarui data pengguna.', 'Gagal', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Terjadi kesalahan jaringan', 'Error', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama, email, atau peran..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
                <th className="p-4 font-semibold">Pengguna</th>
                <th className="p-4 font-semibold">Peran</th>
                <th className="p-4 font-semibold">Mata Pelajaran</th>
                <th className="p-4 font-semibold">Detail Kelas</th>
                <th className="p-4 font-semibold">Tanggal Daftar</th>
                <th className="p-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'GURU' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-gray-800">
                        {user.role === 'GURU' ? (user.subject || '-') : '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {user.role === 'SISWA' ? (
                          user.kelas ? (
                            <>
                              <span className="block text-gray-900 font-medium">{user.kelas}</span>
                              <span className="text-gray-500">{user.jurusan || '-'}</span>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                              Belum Pilih Kelas
                            </span>
                          )
                        ) : (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-xs text-gray-500 font-medium">{user.subject || 'Guru Mapel'}</span>
                            <button
                              onClick={() => handleToggleQuestionAccess(user.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                                user.can_create_question_override
                                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                              title="Klik untuk mengubah saklar izin pembuatan soal oleh guru pada hari H ujian"
                            >
                              {user.can_create_question_override ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Bebas Buat Soal (Override On)</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Terkunci Hari H (Default)</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(user)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors inline-flex items-center"
                          title="Edit Pengguna (Kelas / Role / Mapel)"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedUserForPassword(user);
                            setPasswordModalOpen(true);
                          }}
                          className="p-2 text-primary-blue hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                          title="Ganti Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Ganti Password</h3>
              <button onClick={() => setPasswordModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Masukkan password baru untuk pengguna <strong className="text-gray-900">{selectedUserForPassword?.name}</strong>.
            </p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Password baru (min. 6 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-primary-blue hover:bg-primary-blue-dark text-white font-semibold rounded-xl transition-colors"
              >
                Simpan Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Edit Data Pengguna</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peran (Role)</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none bg-white"
                >
                  <option value="SISWA">SISWA</option>
                  <option value="GURU">GURU</option>
                </select>
              </div>

              {editForm.role === 'SISWA' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                    <input
                      type="text"
                      placeholder="Contoh: X DKV 1"
                      value={editForm.kelas}
                      onChange={(e) => setEditForm({ ...editForm, kelas: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                    <input
                      type="text"
                      placeholder="Contoh: DKV"
                      value={editForm.jurusan}
                      onChange={(e) => setEditForm({ ...editForm, jurusan: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran (Mapel)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Guru Informatika"
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue outline-none"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary-blue hover:bg-primary-blue-dark text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={alertData.isOpen}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
      />

      <ConfirmModal
        isOpen={confirmData.isOpen}
        title={confirmData.title}
        message={confirmData.message}
        onConfirm={confirmData.onConfirm}
        onCancel={() => setConfirmData({ ...confirmData, isOpen: false })}
      />
    </div>
  );
}
