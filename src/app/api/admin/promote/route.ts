import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
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

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found in database. They must login first.' }, { status: 404 });
    }

    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    return NextResponse.json({ success: true, message: 'User promoted to ADMIN' });
  } catch (error) {
    console.error('Error promoting admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
