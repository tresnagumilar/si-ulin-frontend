'use client';
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Aksi',
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = true,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-in-center border border-gray-100 text-center">
        <div className="flex flex-col items-center space-y-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-primary-blue'}`}>
            {isDanger ? <Trash2 className="w-7 h-7" /> : <HelpCircle className="w-7 h-7" />}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            {message}
          </p>

          <div className="flex gap-3 w-full pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 ${
                isDanger ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-primary-blue hover:bg-primary-blue-dark shadow-blue-200'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
