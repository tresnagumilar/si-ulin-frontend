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
    const { examId, content, optionA, optionB, optionC, optionD, optionE, answer, imageUrl } = body;

    if (!examId || !content || !optionA || !optionB || !optionC || !optionD || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        examId,
        content,
        optionA,
        optionB,
        optionC,
        optionD,
        optionE,
        answer,
        imageUrl
      }
    });
    
    // Update totalQuestions in Exam
    await prisma.exam.update({
      where: { id: examId },
      data: { totalQuestions: { increment: 1 } }
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
