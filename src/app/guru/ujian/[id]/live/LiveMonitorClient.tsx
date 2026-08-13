'use client';
import { useState, useEffect } from 'react';
import { Users, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

type Participant = {
  id: string;
  user: {
    name: string;
    kelas: string;
    avatar?: string | null;
  };
  startedAt: string;
  answersCount: number;
  totalQuestions?: number;
  isWarning?: boolean;
  cheatCount: number;
  lastActive: string;
};

type LiveStats = {
  totalActive: number;
  totalFinished: number;
  participants: Participant[];
  recentCheats?: any[];
};

export default function LiveMonitorClient({ examId, token }: { examId: string, token: string }) {
  // Use SWR for polling every 5 seconds
  const fetcher = (url: string) => fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(res => res.json());

  const { data, error, isLoading } = useSWR<LiveStats>(
    `${API_URL}/api/exams/${examId}/live-stats`, 
    fetcher, 
    { refreshInterval: 5000 }
  );

  if (isLoading && !data) {
    return <div className="text-center p-12 text-gray-500 animate-pulse">Menghubungkan ke Server Ujian...</div>;
  }
  
  if (error) {
    return <div className="text-center p-12 text-red-500">Gagal mengambil data Live Monitor.</div>;
  }

  const stats = data!;
  const totalStudents = stats.totalActive + stats.totalFinished;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-primary-blue rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sedang Mengerjakan</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.totalActive}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Selesai</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.totalFinished}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm flex items-center gap-4 bg-red-50/30">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-500 uppercase tracking-wider">Kecurangan (Total)</p>
            <h3 className="text-3xl font-black text-red-700">{stats.recentCheats?.length || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Participants */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Peserta Aktif
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-gray-500">
                  <th className="py-3 font-semibold">Nama Siswa</th>
                  <th className="py-3 font-semibold">Mulai Pukul</th>
                  <th className="py-3 font-semibold">Progress</th>
                  <th className="py-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.participants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">Belum ada siswa yang sedang mengerjakan.</td>
                  </tr>
                ) : (
                  stats.participants.map(p => {
                    const progress = (p.totalQuestions && p.totalQuestions > 0) ? Math.round((p.answersCount / p.totalQuestions) * 100) : 0;
                    return (
                      <tr key={p.id} className={`border-b border-gray-50 ${p.isWarning ? 'bg-red-50/50' : ''}`}>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden shrink-0">
                              {p.user.avatar ? (
                                <img src={p.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                                  {p.user.name.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{p.user.name}</p>
                              <p className="text-xs text-gray-500">{p.user.kelas}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {new Date(p.startedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-blue rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-500">{p.answersCount}/{p.totalQuestions}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          {p.isWarning ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                              <AlertTriangle className="w-3 h-3" /> Pelanggaran ({p.cheatCount})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              <CheckCircle className="w-3 h-3" /> Aman
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Activity Log */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-[500px]">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" /> Log Aktivitas
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {!stats.recentCheats || stats.recentCheats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Belum ada aktivitas mencurigakan.
              </div>
            ) : (
              stats.recentCheats.map(log => (
                <div key={log.id} className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-red-700 text-sm">{log.student_name}</span>
                    <span className="text-xs text-red-500 font-semibold">{log.time}</span>
                  </div>
                  <p className="text-sm text-red-600 leading-snug">{log.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
