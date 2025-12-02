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
  isAdmin: boolean;
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
          return null;
        }

        const result = await db.query<UserRow>(
          `
          SELECT
            id,
            email,
            password_hash AS "passwordHash",
            voornaam,
            achternaam,
            is_admin AS "isAdmin"
          FROM users
          WHERE email = $1
          LIMIT 1
        `,
          [credentials.email]
        );

        const user = result.rows[0];
        if (!user) {
          // geen gebruiker gevonden
          return null;
        }

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) {
          // wachtwoord klopt niet
          return null;
        }

        // geldige login
        return {
          id: user.id,
          email: user.email,
          voornaam: user.voornaam,
          achternaam: user.achternaam,
          isAdmin: user.isAdmin,
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
