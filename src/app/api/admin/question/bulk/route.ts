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
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { examId, questions } = body;

    if (!examId || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Insert all questions
    const created = await prisma.question.createMany({
      data: questions.map(q => ({
        examId,
        content: q.content,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        optionE: q.optionE || null,
        answer: q.answer,
        imageUrl: q.imageUrl || null
      }))
    });

    // Update totalQuestions in Exam
    await prisma.exam.update({
      where: { id: examId },
      data: { totalQuestions: { increment: created.count } }
    });

    return NextResponse.json({ success: true, count: created.count }, { status: 201 });
  } catch (error) {
    console.error('Error in bulk question import:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
