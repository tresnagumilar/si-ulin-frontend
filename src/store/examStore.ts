import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Answer {
  questionId: string;
  selectedOption: string;
}

interface ExamState {
  examId: string | null;
  userId: string | null;
  attemptId: string | null;
  serverEndTime: number | null;
  answers: Record<string, Answer>;
  isFinished: boolean;

  startExam: (examId: string, attemptId: string, userId: string, durationMin: number) => void;
  setAnswer: (questionId: string, selectedOption: string) => void;
  finishExam: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      examId: null,
      userId: null,
      attemptId: null,
      serverEndTime: null,
      answers: {},
      isFinished: false,

      startExam: (examId, attemptId, userId, durationMin) => {
        const endTime = Date.now() + durationMin * 60 * 1000;
        set({ examId, userId, attemptId, serverEndTime: endTime, answers: {}, isFinished: false });
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
      resetExam: () => set({ examId: null, userId: null, attemptId: null, serverEndTime: null, answers: {}, isFinished: false }),
    }),
    {
      name: 'offline-exam-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
