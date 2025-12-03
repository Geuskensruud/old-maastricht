// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = (await req.json()) as {
      token?: string;
      password?: string;
    };

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Ongeldige aanvraag.' },
        { status: 400 }
      );
    }

    // Zoek token
    const tokenRes = await db.query<{
      user_id: string;
      expires_at: string;
      gebruikt: boolean;
    }>(
      `
        SELECT user_id, expires_at, gebruikt
        FROM wachtwoord_reset_tokens
        WHERE token = $1
      `,
      [token]
    );

    if (tokenRes.rowCount === 0) {
      return NextResponse.json(
        { error: 'Ongeldige of verlopen reset-link.' },
        { status: 400 }
      );
    }

    const row = tokenRes.rows[0];

    if (row.gebruikt) {
      return NextResponse.json(
        { error: 'Deze reset-link is al gebruikt.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(row.expires_at);
    if (expiresAt.getTime() < now.getTime()) {
      return NextResponse.json(
        { error: 'Deze reset-link is verlopen.' },
        { status: 400 }
      );
    }

    // Hash nieuw wachtwoord
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user
    await db.query(
      `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
      `,
      [passwordHash, row.user_id]
    );

    // Markeer token als gebruikt
    await db.query(
      `
        UPDATE wachtwoord_reset_tokens
        SET gebruikt = TRUE
        WHERE token = $1
      `,
      [token]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[reset-password] error:', err);
    return NextResponse.json(
      { error: 'Wachtwoord resetten is mislukt.' },
      { status: 500 }
    );
  }
}
