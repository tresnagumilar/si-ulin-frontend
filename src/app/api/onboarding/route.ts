import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    
    // If user is not logged in via Google, return unauthorized
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, kelas, jurusan, dob } = body;

    if (!name || !kelas || !jurusan || !dob) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Upsert user into MySQL database
    const user = await prisma.user.upsert({
      where: {
        email: session.user.email,
      },
      update: {
        name,
        kelas,
        jurusan,
        dob,
      },
      create: {
        email: session.user.email,
        name,
        kelas,
        jurusan,
        dob,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 200 });

  } catch (error) {
    console.error('Onboarding Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
