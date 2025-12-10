// app/api/account/update/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Niet ingelogd.' },
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

    const body = (await req.json()) as {
      voornaam?: string;
      achternaam?: string;
      bedrijfsnaam?: string;
      telefoon?: string;
      straat?: string;
      postcode?: string;
      plaats?: string;
      land?: string;
    };

    const {
      voornaam,
      achternaam,
      bedrijfsnaam,
      telefoon,
      straat,
      postcode,
      plaats,
      land,
    } = body;

    // Basisvalidatie – alle velden behalve bedrijfsnaam verplicht
    if (
      !voornaam ||
      !achternaam ||
      !telefoon ||
      !straat ||
      !postcode ||
      !plaats ||
      !land
    ) {
      return NextResponse.json(
        { error: 'Vul alle verplichte velden in.' },
        { status: 400 }
      );
    }

    const params = [
      voornaam,
      achternaam,
      bedrijfsnaam ?? null,
      telefoon,
      straat,
      postcode,
      plaats,
      land,
    ];

    let result;
    if (userId) {
      result = await db.query(
        `
        UPDATE users
        SET
          voornaam = $1,
          achternaam = $2,
          bedrijfsnaam = $3,
          telefoon = $4,
          straat = $5,
          postcode = $6,
          plaats = $7,
          land = $8
        WHERE id = $9
        RETURNING id
        `,
        [...params, userId]
      );
    } else {
      result = await db.query(
        `
        UPDATE users
        SET
          voornaam = $1,
          achternaam = $2,
          bedrijfsnaam = $3,
          telefoon = $4,
          straat = $5,
          postcode = $6,
          plaats = $7,
          land = $8
        WHERE email = $9
        RETURNING id
        `,
        [...params, userEmail]
      );
    }

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/account/update] error:', err);
    return NextResponse.json(
      { error: 'Kon accountgegevens niet bijwerken.' },
      { status: 500 }
    );
  }
}
