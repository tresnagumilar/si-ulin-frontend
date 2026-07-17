import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ExamClient from './ExamClient';

export default async function UjianPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/onboarding');
  }

  // Find Exam
  let exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: { questions: true }
  });

  // SEEDING DUMMY EXAM FOR TESTING PURPOSES IF NOT FOUND
  if (!exam) {
    if (params.id === 'matematika-uts') {
      exam = await prisma.exam.create({
        data: {
          id: 'matematika-uts',
          title: 'Ujian Tengah Semester Matematika',
          subject: 'Matematika',
          durationMin: 90,
          totalQuestions: 3,
          isLive: true,
          questions: {
            create: [
              {
                content: 'Berapakah hasil dari 2 + 2?',
                optionA: '3',
                optionB: '4',
                optionC: '5',
                optionD: '6',
                answer: 'B'
              },
              {
                content: 'Turunan pertama dari f(x) = x^2 adalah?',
                optionA: 'x',
                optionB: '2x',
                optionC: 'x^2',
                optionD: '2',
                answer: 'B'
              },
              {
                content: 'Akar kuadrat dari 144 adalah?',
                optionA: '12',
                optionB: '14',
                optionC: '16',
                optionD: '10',
                answer: 'A'
              }
            ]
          }
        },
        include: { questions: true }
      });
    } else {
      redirect('/dashboard/siswa'); // Real exam not found
    }
  }

  // Check if they already attempted and finished
  const existingAttempt = await prisma.examAttempt.findUnique({
    where: {
      userId_examId: { userId: user.id, examId: exam.id }
    }
  });

  if (existingAttempt?.finishedAt) {
    // Already submitted
    redirect('/dashboard/siswa/nilai');
  }

  // Return the client component to handle interactiveness
  // We don't pass the correct `answer` to the client for security!
  const safeQuestions = exam.questions.map(q => ({
    id: q.id,
    content: q.content,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    optionE: q.optionE,
  }));

  return (
    <ExamClient 
      exam={{
        id: exam.id,
        title: exam.title,
        durationMin: exam.durationMin,
      }}
      questions={safeQuestions}
    />
  );
}
