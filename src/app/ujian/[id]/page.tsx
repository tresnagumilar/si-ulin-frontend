import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ExamClient from './ExamClient';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { API_URL } from '@/lib/api';

export default async function UjianPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = (await getServerSession(authOptions)) as any;
  
  if (!session || !session.user) {
    redirect('/');
  }

  // Find Exam
  const res = await fetch(`${API_URL}/api/exams/${resolvedParams.id}`, {
    headers: {
      'Authorization': `Bearer ${session.user.token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    redirect('/dashboard/siswa');
  }

  const exam = await res.json();

  // Return the client component to handle interactiveness
  // We don't pass the correct `answer` to the client for security!
  const safeQuestions = exam.questions.map((q: any) => ({
    id: q.id,
    type: q.type || 'PG',
    content: q.content,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    optionE: q.optionE,
    imageUrl: q.imageUrl,
  }));

  return (
    <ExamClient 
      exam={{
        id: exam.id,
        title: exam.title,
        durationMin: exam.durationMin,
        requiresToken: !!exam.exam_token
      }}
      questions={safeQuestions}
      token={session.user.token!}
    />
  );
}
