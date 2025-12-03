// app/api/auth/request-password-reset/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };

    if (!email) {
      return NextResponse.json(
        { error: 'E-mailadres is verplicht.' },
        { status: 400 }
      );
    }

    // Zoek user op e-mailadres
    const userResult = await db.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    // We antwoorden altijd "ok", ook als er geen user is (privacy)
    if (userResult.rowCount === 0) {
      return NextResponse.json({ ok: true });
    }

    const userId = userResult.rows[0].id;

    // Genereer token
    const token = crypto.randomBytes(32).toString('hex');
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 uur geldig

    await db.query(
      `
        INSERT INTO wachtwoord_reset_tokens (
          id,
          user_id,
          token,
          expires_at,
          gebruikt
        )
        VALUES ($1, $2, $3, $4, FALSE)
      `,
      [id, userId, token, expiresAt.toISOString()]
    );

    const origin = new URL(req.url).origin;
    const resetLink = `${origin}/wachtwoord-resetten?token=${encodeURIComponent(
      token
    )}`;

    // Nodemailer transporter (zelfde SMTP als je factuur-mail)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Wachtwoord resetten - Old Maastricht',
      text: `Je hebt gevraagd om je wachtwoord te resetten.\n\nKlik op de onderstaande link om een nieuw wachtwoord in te stellen:\n\n${resetLink}\n\nAls jij dit niet was, kun je deze e-mail negeren.`,
      html: `
        <p>Je hebt gevraagd om je wachtwoord te resetten.</p>
        <p>Klik op de onderstaande link om een nieuw wachtwoord in te stellen:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Als jij dit niet was, kun je deze e-mail negeren.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[request-password-reset] error:', err);
    return NextResponse.json(
      { error: 'Kon geen reset-link versturen.' },
      { status: 500 }
    );
  }
}
