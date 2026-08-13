import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      token?: string;
      tgl_lahir?: string | null;
      kelas?: string | null;
      jurusan?: string | null;
      is_approved?: boolean;
      subject?: string | null;
      nuptk?: string | null;
      nis?: string | null;
      nisn?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    token?: string;
    tgl_lahir?: string | null;
    kelas?: string | null;
    jurusan?: string | null;
    is_approved?: boolean;
    subject?: string | null;
    nuptk?: string | null;
    nis?: string | null;
    nisn?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    token?: string;
    tgl_lahir?: string | null;
    kelas?: string | null;
    jurusan?: string | null;
    is_approved?: boolean;
    subject?: string | null;
    nuptk?: string | null;
    nis?: string | null;
    nisn?: string | null;
  }
}
