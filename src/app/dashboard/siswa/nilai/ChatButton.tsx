'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatModal from '@/components/ChatModal';

interface ChatButtonProps {
  attemptId: string;
  examTitle: string;
}

export default function ChatButton({ attemptId, examTitle }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100"
        title="Buka Komentar & Diskusi"
      >
        <MessageSquare className="w-4 h-4" /> Komentar
      </button>
      
      {isOpen && (
        <ChatModal 
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          attemptId={attemptId}
          title={`Ujian: ${examTitle}`}
        />
      )}
    </>
  );
}
