// app/account/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import AccountClient from './AccountClient';

type DbUser = {
  id: string;
  email: string;
  voornaam: string;
  achternaam: string;
  bedrijfsnaam: string | null;
  telefoon: string;
  straat: string;
  postcode: string;
  plaats: string;
  land: string;
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login?callbackUrl=/account');
  }

  const userAny = session.user as any;
  const userId = userAny.id as string | undefined;
  const userEmail = session.user.email as string | undefined;

  if (!userId && !userEmail) {
    redirect('/login?callbackUrl=/account');
  }

  const result = userId
    ? await db.query<DbUser>(
        `
        SELECT
          id,
          email,
          voornaam,
          achternaam,
          bedrijfsnaam,
          telefoon,
          straat,
          postcode,
          plaats,
          land
        FROM users
        WHERE id = $1
        `,
        [userId]
      )
    : await db.query<DbUser>(
        `
        SELECT
          id,
          email,
          voornaam,
          achternaam,
          bedrijfsnaam,
          telefoon,
          straat,
          postcode,
          plaats,
          land
        FROM users
        WHERE email = $1
        `,
        [userEmail]
      );

  if (result.rows.length === 0) {
    redirect('/login');
  }

  const user = result.rows[0];

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h1
        style={{
          fontSize: '1.8rem',
          marginBottom: '0.75rem',
          color: '#521f0a',
        }}
      >
        Mijn account
      </h1>

      <p
        style={{
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          color: '#5c4940',
        }}
      >
        Hier zie je de gegevens die bij jouw account horen en kun je ze aanpassen.
      </p>

      <AccountClient
        initialUser={{
          email: user.email,
          voornaam: user.voornaam,
          achternaam: user.achternaam,
          bedrijfsnaam: user.bedrijfsnaam ?? '',
          telefoon: user.telefoon,
          straat: user.straat,
          postcode: user.postcode,
          plaats: user.plaats,
          land: user.land,
        }}
      />
    </main>
  );
}
