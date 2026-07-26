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
    const { title, subject, durationMin } = body;

    if (!title || !subject || !durationMin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        title,
        subject,
        durationMin: parseInt(durationMin),
        totalQuestions: 0,
        isLive: false
      }
    });

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
