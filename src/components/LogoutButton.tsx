'use client';

import { useState } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useExamStore } from '@/store/examStore';

interface LogoutButtonProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export default function LogoutButton({ 
  className = "flex flex-col items-center text-gray-400 hover:text-red-500 transition-colors", 
  iconClassName = "w-6 h-6 mb-1",
  textClassName = "text-[10px] font-semibold",
  showText = true 
}: LogoutButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    setShowModal(false);
    useExamStore.getState().resetExam();
    signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className={className} type="button">
        <LogOut className={iconClassName} />
        {showText && <span className={textClassName}>Keluar</span>}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Keluar dari Aplikasi?</h3>
              <p className="text-sm text-gray-500">
                Apakah Anda yakin ingin keluar? Anda harus login kembali untuk mengakses aplikasi.
              </p>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
