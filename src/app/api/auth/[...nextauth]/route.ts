import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
const BACKEND_URL = rawBackendUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const authOptions: NextAuthOptions = {
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/login`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(credentials)
          });
          
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Backend server (Laravel http://localhost:8000) is unreachable or returned an HTML error page. Ensure Laravel backend is running.");
          }

          const data = await res.json();
          if (res.ok && data.user) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role: data.user.role,
              token: data.access_token,
              is_approved: data.user.is_approved,
              kelas: data.user.kelas,
              jurusan: data.user.jurusan,
              tgl_lahir: data.user.tgl_lahir,
              nis: data.user.nis,
              nisn: data.user.nisn,
              nuptk: data.user.nuptk,
              subject: data.user.subject,
            };
          }
          // Reject
          throw new Error(data.message || "Login gagal");
        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  pages: {
    signIn: "/",
    error: "/"
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        try {
          const cookieStore = await cookies();
          const selectedRole = cookieStore.get('selectedRole')?.value || 'SISWA';

          const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              google_id: profile?.sub,
              email: user.email,
              name: user.name,
              role: selectedRole
            })
          });

          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Backend server (Laravel http://localhost:8000) is unreachable or returned an HTML error page.");
          }

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || "Akun tidak diizinkan");
          }
          (user as any).role = data.user.role;
          (user as any).token = data.access_token;
          user.id = data.user.id;
          (user as any).is_approved = data.user.is_approved;
          (user as any).kelas = data.user.kelas;
          (user as any).jurusan = data.user.jurusan;
          (user as any).tgl_lahir = data.user.tgl_lahir;
          (user as any).nis = data.user.nis;
          (user as any).nisn = data.user.nisn;
          (user as any).nuptk = data.user.nuptk;
          (user as any).subject = data.user.subject;
          return true;
        } catch (error: any) {
          return "/?error=" + encodeURIComponent(error.message);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).token;
        token.id = user.id;
        token.is_approved = (user as any).is_approved;
        token.kelas = (user as any).kelas;
        token.jurusan = (user as any).jurusan;
        token.tgl_lahir = (user as any).tgl_lahir;
        token.nis = (user as any).nis;
        token.nisn = (user as any).nisn;
        token.nuptk = (user as any).nuptk;
        token.subject = (user as any).subject;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.role) token.role = session.role;
        if (session.is_approved !== undefined) token.is_approved = session.is_approved;
        if (session.kelas !== undefined) token.kelas = session.kelas;
        if (session.jurusan !== undefined) token.jurusan = session.jurusan;
        if (session.tgl_lahir !== undefined) token.tgl_lahir = session.tgl_lahir;
        if (session.nis !== undefined) token.nis = session.nis;
        if (session.nisn !== undefined) token.nisn = session.nisn;
        if (session.nuptk !== undefined) token.nuptk = session.nuptk;
        if (session.subject !== undefined) token.subject = session.subject;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user = {
          ...session.user,
          role: token.role as string,
          token: token.accessToken as string,
          id: token.id as string,
          is_approved: token.is_approved as boolean,
          kelas: token.kelas as string | null,
          jurusan: token.jurusan as string | null,
          tgl_lahir: token.tgl_lahir as string | null,
          nis: token.nis as string | null,
          nisn: token.nisn as string | null,
          nuptk: token.nuptk as string | null,
          subject: token.subject as string | null,
        } as any;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret"
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
