import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const attempts = await prisma.examAttempt.findMany({
      where: { 
        examId: resolvedParams.id,
        finishedAt: { not: null }
      },
      include: {
        user: {
          select: { name: true, kelas: true, jurusan: true }
        }
      },
      orderBy: { score: 'desc' }
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Error fetching exam results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
