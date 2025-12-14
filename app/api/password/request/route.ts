// app/api/password/request/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht.' },
        { status: 400 }
      );
    }

    // Zoek user
    const userRes = await db.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    // Voor security: altijd 200 teruggeven, ook als user niet bestaat
    if (userRes.rowCount === 0) {
      return NextResponse.json({ ok: true });
    }

    const userId = userRes.rows[0].id;
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 uur geldig

    // Oude tokens opruimen (optioneel)
    await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [
      userId,
    ]);

    // Nieuw token opslaan
    await db.query(
      `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `,
      [userId, token, expiresAt]
    );

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const resetUrl = `${origin}/wachtwoord-resetten?token=${encodeURIComponent(
      token
    )}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const text = [
      'Je hebt een verzoek gedaan om je wachtwoord te resetten.',
      '',
      `Gebruik de volgende link om een nieuw wachtwoord in te stellen:`,
      resetUrl,
      '',
      'Als jij dit niet hebt aangevraagd, kun je deze e-mail negeren.',
    ].join('\n');

    const html = `
      <p>Je hebt een verzoek gedaan om je wachtwoord te resetten.</p>
      <p>
        Klik op de onderstaande link om een nieuw wachtwoord in te stellen:<br/>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      </p>
      <p>Als jij dit niet hebt aangevraagd, kun je deze e-mail negeren.</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Wachtwoord resetten - Old Maastricht',
      text,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[password/request] error:', err);

    // TIJDELIJK extra info teruggeven om te debuggen
    return NextResponse.json(
      {
        error: 'Kon reset-link niet versturen.',
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
