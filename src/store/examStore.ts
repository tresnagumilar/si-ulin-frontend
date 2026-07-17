import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Answer {
  questionId: string;
  selectedOption: string; // 'A', 'B', 'C', 'D', 'E'
}

interface ExamState {
  examId: string | null;
  serverEndTime: number | null; // Timestamp representing when the exam must end
  answers: Record<string, Answer>; // Key: questionId
  isFinished: boolean;

  startExam: (examId: string, durationMin: number) => void;
  setAnswer: (questionId: string, selectedOption: string) => void;
  finishExam: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      examId: null,
      serverEndTime: null,
      answers: {},
      isFinished: false,

      startExam: (examId, durationMin) => {
        // Calculate end time based on the server's permission.
        // In a real app, you might fetch this exactly from the server.
        // For now, we set the end time relative to the local clock 
        // (but ideally validated on server during submission).
        const endTime = Date.now() + durationMin * 60 * 1000;
        set({ examId, serverEndTime: endTime, answers: {}, isFinished: false });
      },

      setAnswer: (questionId, selectedOption) => {
        const { isFinished, serverEndTime } = get();
        if (isFinished || (serverEndTime && Date.now() > serverEndTime)) {
          // Cannot change answers if finished or time is up
          return;
        }

        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: { questionId, selectedOption },
          },
        }));
      },

      finishExam: () => set({ isFinished: true }),
      resetExam: () => set({ examId: null, serverEndTime: null, answers: {}, isFinished: false }),
    }),
    {
      name: 'offline-exam-storage', // Will be saved in localStorage automatically
      storage: createJSONStorage(() => localStorage),
    }
  )
);
