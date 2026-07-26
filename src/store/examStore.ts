import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Answer {
  questionId: string;
  selectedOption: string; // 'A', 'B', 'C', 'D', 'E'
}

interface ExamState {
  examId: string | null;
  attemptId: string | null;
  serverEndTime: number | null; // Timestamp representing when the exam must end
  answers: Record<string, Answer>; // Key: questionId
  isFinished: boolean;

  startExam: (examId: string, attemptId: string, durationMin: number) => void;
  setAnswer: (questionId: string, selectedOption: string) => void;
  finishExam: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      examId: null,
      attemptId: null,
      serverEndTime: null,
      answers: {},
      isFinished: false,

      startExam: (examId, attemptId, durationMin) => {
        const endTime = Date.now() + durationMin * 60 * 1000;
        set({ examId, attemptId, serverEndTime: endTime, answers: {}, isFinished: false });
      },

      setAnswer: (questionId, selectedOption) => {
        const { isFinished, serverEndTime } = get();
        if (isFinished || (serverEndTime && Date.now() > serverEndTime)) {
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
      resetExam: () => set({ examId: null, attemptId: null, serverEndTime: null, answers: {}, isFinished: false }),
    }),
    {
      name: 'offline-exam-storage', // Will be saved in localStorage automatically
      storage: createJSONStorage(() => localStorage),
    }
  )
);
