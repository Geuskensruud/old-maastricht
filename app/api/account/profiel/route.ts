// app/api/account/profiel/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Niet ingelogd' },
        { status: 401 }
      );
    }

    const userAny = session.user as any;
    const userId = userAny.id as string | undefined;
    const userEmail = session.user.email as string | undefined;

    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'Geen gebruikers-ID of e-mail in sessie gevonden.' },
        { status: 400 }
      );
    }

    // Gebruik de kolommen die je echt hebt:
    // id, email, password_hash, voornaam, achternaam, bedrijfsnaam,
    // telefoon, straat, postcode, plaats, land, is_admin, created_at
    const result = userId
      ? await db.query(
          `
          SELECT
            id,
            voornaam,
            achternaam,
            bedrijfsnaam,
            email,
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
      : await db.query(
          `
          SELECT
            id,
            voornaam,
            achternaam,
            bedrijfsnaam,
            email,
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
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden.' },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    // Map naar de shape die /afrekenen gebruikt
    const land = (row.land as string | null) ?? 'Nederland';

    return NextResponse.json({
      voornaam: row.voornaam ?? '',
      achternaam: row.achternaam ?? '',
      bedrijfsnaam: row.bedrijfsnaam ?? '',
      email: row.email ?? '',
      telefoon: row.telefoon ?? '',
      landRegio: land,

      straatHuisnummer: row.straat ?? '',
      postcode: row.postcode ?? '',
      plaats: row.plaats ?? '',

      // Geen aparte verzendkolommen in DB → standaard gelijk aan factuuradres
      verzendLandRegio: land,
      verzendStraatHuisnummer: row.straat ?? '',
      verzendPostcode: row.postcode ?? '',
      verzendPlaats: row.plaats ?? '',
    });
  } catch (err) {
    console.error('[api/account/profiel] error:', err);
    return NextResponse.json(
      { error: 'Kon profielgegevens niet ophalen.' },
      { status: 500 }
    );
  }
}
