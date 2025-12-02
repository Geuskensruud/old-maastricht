import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

type Land = 'NEDERLAND' | 'BELGIE' | 'DUITSLAND';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      email,
      wachtwoord,
      voornaam,
      achternaam,
      bedrijfsnaam,
      telefoon,
      straat,
      postcode,
      plaats,
      land,
    } = body as {
      email: string;
      wachtwoord: string;
      voornaam: string;
      achternaam: string;
      bedrijfsnaam?: string;
      telefoon: string;
      straat: string;
      postcode: string;
      plaats: string;
      land: Land;
    };

    if (!email || !wachtwoord) {
      return NextResponse.json(
        { error: 'E-mail en wachtwoord zijn verplicht.' },
        { status: 400 }
      );
    }

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
        { error: 'Vul alle verplichte gegevens in (behalve bedrijfsnaam mag leeg blijven).' },
        { status: 400 }
      );
    }

    if (!['NEDERLAND', 'BELGIE', 'DUITSLAND'].includes(land)) {
      return NextResponse.json(
        { error: 'Ongeldig land, kies Nederland, België of Duitsland.' },
        { status: 400 }
      );
    }

    // Bestaat al?
    const existing = await db.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json(
        { error: 'Er bestaat al een account met dit e-mailadres.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(wachtwoord, 12);
    const id = randomUUID();

    await db.query(
      `
      INSERT INTO users (
        id,
        email,
        password_hash,
        voornaam,
        achternaam,
        bedrijfsnaam,
        telefoon,
        straat,
        postcode,
        plaats,
        land,
        is_admin,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, FALSE, NOW())
    `,
      [
        id,
        email,
        passwordHash,
        voornaam,
        achternaam,
        bedrijfsnaam ?? null,
        telefoon,
        straat,
        postcode,
        plaats,
        land,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Er is iets misgegaan bij het registreren.' },
      { status: 500 }
    );
  }
}
