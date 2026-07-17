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

    const { examId } = await req.json();

    if (!examId) {
      return NextResponse.json({ error: 'Exam ID required' }, { status: 400 });
    }

    // Check if attempt already exists
    let attempt = await prisma.examAttempt.findUnique({
      where: {
        userId_examId: {
          userId: user.id,
          examId,
        },
      },
    });

    if (!attempt) {
      // Create new attempt, recording the EXACT server time it started
      attempt = await prisma.examAttempt.create({
        data: {
          userId: user.id,
          examId,
          startedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, attempt }, { status: 200 });
  } catch (error) {
    console.error('Exam Start Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
