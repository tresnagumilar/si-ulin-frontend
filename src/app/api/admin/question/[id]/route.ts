import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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

    // Need to get examId before deleting to decrement totalQuestions
    const question = await prisma.question.findUnique({ where: { id: resolvedParams.id }});
    if (!question) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.question.delete({
      where: { id: resolvedParams.id }
    });
    
    await prisma.exam.update({
      where: { id: question.examId },
      data: { totalQuestions: { decrement: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
