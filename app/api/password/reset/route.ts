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
        { error: 'Token en nieuw wachtwoord zijn verplicht.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Het wachtwoord moet minstens 6 tekens bevatten.' },
        { status: 400 }
      );
    }

    const tokenRes = await db.query<{
      user_id: string;
      expires_at: Date;
    }>(
      `
      SELECT user_id, expires_at
      FROM password_reset_tokens
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
    const now = new Date();

    if (row.expires_at < now) {
      await db.query('DELETE FROM password_reset_tokens WHERE token = $1', [
        token,
      ]);
      return NextResponse.json(
        { error: 'De reset-link is verlopen. Vraag een nieuwe aan.' },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
      hash,
      row.user_id,
    ]);

    await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [
      row.user_id,
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[password/reset] error:', err);
    return NextResponse.json(
      { error: 'Kon wachtwoord niet resetten.' },
      { status: 500 }
    );
  }
}
