import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import db from '@/lib/db';

type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  voornaam: string | null;
  achternaam: string | null;
  isAdmin: number; // 0 of 1
};

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },

  providers: [
    Credentials({
      name: 'Inloggen',
      credentials: {
        email: { label: 'E-mail', type: 'text' },
        password: { label: 'Wachtwoord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Vul zowel e-mail als wachtwoord in.');
        }

        const stmt = db.prepare(
          'SELECT id, email, passwordHash, voornaam, achternaam, isAdmin FROM users WHERE email = ?'
        );
        const user = stmt.get(credentials.email) as UserRow | undefined;

        if (!user) {
          throw new Error('Onjuiste e-mail of wachtwoord.');
        }

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) {
          throw new Error('Onjuiste e-mail of wachtwoord.');
        }

        return {
          id: user.id,
          email: user.email,
          voornaam: user.voornaam,
          achternaam: user.achternaam,
          isAdmin: !!user.isAdmin,
        } as any;
      },
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.voornaam = (user as any).voornaam ?? null;
        token.achternaam = (user as any).achternaam ?? null;
        token.isAdmin = (user as any).isAdmin ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        (session.user as any).id = token.id;
        (session.user as any).voornaam = (token as any).voornaam ?? null;
        (session.user as any).achternaam = (token as any).achternaam ?? null;
        (session.user as any).isAdmin = (token as any).isAdmin ?? false;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
