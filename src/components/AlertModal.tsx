'use client';
import { AlertTriangle, Info, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  onClose: () => void;
}

export default function AlertModal({
  isOpen,
  title = 'Pemberitahuan',
  message,
  type = 'warning',
  onClose
}: AlertModalProps) {
  if (!isOpen) return null;

  const bgIcon = type === 'error' || type === 'warning' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-primary-blue';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-in-center border border-gray-100 text-center relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center space-y-3 pt-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bgIcon}`}>
            {type === 'error' || type === 'warning' ? (
              <AlertTriangle className="w-7 h-7" />
            ) : (
              <Info className="w-7 h-7" />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 bg-primary-blue hover:bg-primary-blue-dark text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
