import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { examId, answers } = await req.json();

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID required' }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: {
        userId_examId: { userId: user.id, examId },
      },
      include: {
        exam: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 });
    }

    if (attempt.finishedAt) {
      return NextResponse.json({ error: 'Exam already submitted' }, { status: 400 });
    }

    // SERVER-SIDE TIMER VALIDATION
    // Calculate how much time has passed since the server recorded the start time
    const now = new Date();
    const durationMs = attempt.exam.durationMin * 60 * 1000;
    const timePassedMs = now.getTime() - attempt.startedAt.getTime();
    
    // Allow a 5-minute grace period for network latency / delayed submission
    const GRACE_PERIOD_MS = 5 * 60 * 1000; 

    if (timePassedMs > durationMs + GRACE_PERIOD_MS) {
      return NextResponse.json({ 
        error: 'Waktu ujian telah habis. Pengumpulan ditolak oleh server.',
        timePassed: Math.floor(timePassedMs / 1000),
        allowed: attempt.exam.durationMin * 60
      }, { status: 403 });
    }

    // Process Answers and Calculate Score
    // Since we don't have real questions in DB yet, we just save the JSON
    // and set a dummy score.
    const score = Math.floor(Math.random() * 100);

    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        finishedAt: now,
        answers: JSON.stringify(answers),
        score,
      },
    });

    return NextResponse.json({ success: true, score, attempt: updatedAttempt }, { status: 200 });
  } catch (error) {
    console.error('Exam Submit Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
