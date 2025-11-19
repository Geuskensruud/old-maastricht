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

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json(
        { error: 'Er bestaat al een account met dit e-mailadres.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(wachtwoord, 12);
    const id = randomUUID();

    const stmt = db.prepare(`
      INSERT INTO users (
        id,
        email,
        passwordHash,
        voornaam,
        achternaam,
        bedrijfsnaam,
        telefoon,
        straat,
        postcode,
        plaats,
        land,
        isAdmin,
        createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
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
      0, // ⬅️ normale users zijn GEEN admin
      new Date().toISOString()
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
