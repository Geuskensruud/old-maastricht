// app/api/order/confirm/route.ts
import { NextResponse } from 'next/server';
import stripeClient from '@/lib/stripe';
import db from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';

type ConfirmBody = {
  sessionId?: string;
};

type OrderRow = {
  id: string;
  stripe_session_id: string;
  email: string | null;
  naam: string | null;
  telefoon: string | null;
  factuur_straat: string | null;
  factuur_postcode: string | null;
  factuur_plaats: string | null;
  factuur_land: string | null;
  totaal_cent: number;
};

type OrderRegelRow = {
  product_naam: string;
  prijs_cent: number;
  aantal: number;
};

type UserRow = {
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

export async function POST(req: Request) {
  try {
    const { sessionId } = (await req.json()) as ConfirmBody;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId ontbreekt.' },
        { status: 400 }
      );
    }

    // 1) Stripe sessie ophalen en checken of er betaald is
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        {
          error: `Betaling is nog niet voltooid (status: ${session.payment_status}).`,
        },
        { status: 400 }
      );
    }

    const customer = session.customer_details;
    const lineItems = (session.line_items?.data ?? []) as any[];

    // 2) Regels uit Stripe halen (voor product/prijs info)
    const regelsFromStripe = lineItems.map((li) => {
      const name =
        li.description ||
        li.price?.nickname ||
        (li.price?.product ? String(li.price.product) : 'Onbekend product');

      const unitAmount = li.price?.unit_amount ?? 0; // centen per stuk
      const quantity = li.quantity ?? 1;

      return {
        name,
        unitAmount,
        quantity,
      };
    });

    const totaalCentFromStripe =
      session.amount_total ??
      regelsFromStripe.reduce(
        (sum, r) => sum + r.unitAmount * r.quantity,
        0
      );

    // 3) Gebruiker uit de users-tabel ophalen op basis van e-mail
    const customerEmail =
      customer?.email || session.customer_email || null;

    let user: UserRow | null = null;

    if (customerEmail) {
      const userResult = await db.query<UserRow>(
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
          LIMIT 1
        `,
        [customerEmail]
      );

      const userRowCount = userResult.rowCount ?? 0;
      user = userRowCount > 0 ? userResult.rows[0] : null;
    }

    // 4) Gegevens voor de order:
    //    - primair uit users-tabel
    //    - fallback naar Stripe-gegevens
    const naamVolledig =
      (user
        ? `${user.voornaam} ${user.achternaam}`.trim()
        : customer?.name) || null;

    const telefoon = user?.telefoon ?? customer?.phone ?? null;
    const straat = user?.straat ?? null;
    const postcode = user?.postcode ?? null;
    const plaats = user?.plaats ?? null;
    const land = user?.land ?? customer?.address?.country ?? null;

    const newOrderId = crypto.randomUUID();

    // 5) Order in DB opslaan (idempotent via stripe_session_id)
    const orderResult = await db.query<OrderRow>(
      `
      INSERT INTO orders (
        id,
        stripe_session_id,
        email,
        naam,
        telefoon,
        factuur_straat,
        factuur_postcode,
        factuur_plaats,
        factuur_land,
        totaal_cent
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
      ON CONFLICT (stripe_session_id)
      DO UPDATE SET
        email = EXCLUDED.email,
        naam = EXCLUDED.naam,
        telefoon = EXCLUDED.telefoon,
        factuur_straat = EXCLUDED.factuur_straat,
        factuur_postcode = EXCLUDED.factuur_postcode,
        factuur_plaats = EXCLUDED.factuur_plaats,
        factuur_land = EXCLUDED.factuur_land,
        totaal_cent = EXCLUDED.totaal_cent
      RETURNING
        id,
        stripe_session_id,
        email,
        naam,
        telefoon,
        factuur_straat,
        factuur_postcode,
        factuur_plaats,
        factuur_land,
        totaal_cent
    `,
      [
        newOrderId,
        session.id,
        customerEmail,
        naamVolledig,
        telefoon,
        straat,
        postcode,
        plaats,
        land,
        totaalCentFromStripe,
      ]
    );

    const orderRow = orderResult.rows[0];

    // 6) Orderregels in DB zetten (oude regels eerst weg)
    await db.query('DELETE FROM order_regels WHERE order_id = $1', [
      orderRow.id,
    ]);

    for (const r of regelsFromStripe) {
      await db.query(
        `
        INSERT INTO order_regels (
          id,
          order_id,
          product_naam,
          prijs_cent,
          aantal
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          crypto.randomUUID(),
          orderRow.id,
          r.name,
          r.unitAmount,
          r.quantity,
        ]
      );
    }

    // 7) Order + regels opnieuw UIT DB lezen voor e-mail
    const orderDbResult = await db.query<OrderRow>(
      `
      SELECT
        id,
        stripe_session_id,
        email,
        naam,
        telefoon,
        factuur_straat,
        factuur_postcode,
        factuur_plaats,
        factuur_land,
        totaal_cent
      FROM orders
      WHERE stripe_session_id = $1
    `,
      [session.id]
    );

    const orderRowCount = orderDbResult.rowCount ?? 0;
    if (orderRowCount === 0) {
      throw new Error('Order niet gevonden na opslaan.');
    }

    const order = orderDbResult.rows[0];

    const regelsDbResult = await db.query<OrderRegelRow>(
      `
      SELECT
        product_naam,
        prijs_cent,
        aantal
      FROM order_regels
      WHERE order_id = $1
      ORDER BY product_naam ASC
    `,
      [order.id]
    );

    const regels = regelsDbResult.rows;

    // 8) E-mail opbouwen op basis van DB-gegevens

    const totaalEuro = (order.totaal_cent / 100)
      .toFixed(2)
      .replace('.', ',');

    const orderNummer = order.stripe_session_id
      .slice(-8)
      .toUpperCase();

    const regelsRowsHtml = regels
      .map((r) => {
        const prijsEuro = (r.prijs_cent / 100).toFixed(2).replace('.', ',');
        const regelTotaalEuro = (
          (r.prijs_cent * r.aantal) /
          100
        )
          .toFixed(2)
          .replace('.', ',');

        return `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">
              ${r.product_naam}
            </td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: center;">
              ${r.aantal}
            </td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">
              € ${prijsEuro}
            </td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right;">
              € ${regelTotaalEuro}
            </td>
          </tr>
        `;
      })
      .join('');

    const afleverNaam = order.naam || '';
    const afleverStraat = order.factuur_straat || '';
    const afleverPostcodePlaats = [order.factuur_postcode, order.factuur_plaats]
      .filter(Boolean)
      .join(' ');
    const afleverLand = order.factuur_land || '';

    const tekstKlantnaam = afleverNaam || 'klant';

    const html = `
<!doctype html>
<html lang="nl">
  <head>
    <meta charSet="UTF-8" />
    <title>Bestelbevestiging - Old Maastricht</title>
  </head>
  <body style="margin:0; padding:0; background:#f5f1e8; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#2a1a10;">
    <table width="100%" border="0" cellPadding="0" cellSpacing="0" style="background:#f5f1e8; padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellPadding="0" cellSpacing="0" style="background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 18px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#521f0a; padding:16px 24px;" align="center">
                <img src="cid:logo@oldmaastricht" alt="Old Maastricht" style="max-height:80px; display:block; margin-bottom:8px;" />
                <div style="color:#f8e8c9; font-size:13px; letter-spacing:1px; text-transform:uppercase;">
                  De meest rebelse kaas van Nederland
                </div>
              </td>
            </tr>

            <!-- Titel / intro -->
            <tr>
              <td style="padding:24px 24px 8px;">
                <h1 style="margin:0 0 8px; font-size:22px; color:#2a1a10;">
                  Bedankt voor je bestelling, ${tekstKlantnaam}!
                </h1>
                <p style="margin:0; font-size:14px; color:#5b4634;">
                  We hebben je bestelling ontvangen en gaan aan de slag in onze rijpingskamers.
                </p>
              </td>
            </tr>

            <!-- Order info -->
            <tr>
              <td style="padding:8px 24px 16px;">
                <table width="100%" border="0" cellPadding="0" cellSpacing="0">
                  <tr>
                    <td style="font-size:13px; color:#7b6450; padding-bottom:4px;">
                      <strong>Bestelnummer:</strong> ${orderNummer}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:13px; color:#7b6450;">
                      <strong>Totaalbedrag:</strong> € ${totaalEuro}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Bestelde producten -->
            <tr>
              <td style="padding:8px 24px 16px;">
                <h2 style="margin:0 0 8px; font-size:16px; color:#2a1a10;">
                  Overzicht van je bestelling
                </h2>
                <table width="100%" border="0" cellPadding="0" cellSpacing="0" style="border-collapse:collapse; font-size:13px;">
                  <thead>
                    <tr>
                      <th align="left" style="padding:8px 12px; border-bottom:2px solid #e4d5b8;">Product</th>
                      <th align="center" style="padding:8px 12px; border-bottom:2px solid #e4d5b8;">Aantal</th>
                      <th align="right" style="padding:8px 12px; border-bottom:2px solid #e4d5b8;">Prijs/st.</th>
                      <th align="right" style="padding:8px 12px; border-bottom:2px solid #e4d5b8;">Totaal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${regelsRowsHtml}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style="padding:10px 12px; text-align:right; font-weight:700; border-top:2px solid #e4d5b8;">
                        Totaal
                      </td>
                      <td style="padding:10px 12px; text-align:right; font-weight:700; border-top:2px solid #e4d5b8;">
                        € ${totaalEuro}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>

            <!-- Adresblok -->
            <tr>
              <td style="padding:8px 24px 24px;">
                <h2 style="margin:0 0 8px; font-size:16px; color:#2a1a10;">
                  Factuur- / afleveradres
                </h2>
                <table width="100%" border="0" cellPadding="0" cellSpacing="0" style="font-size:13px; color:#5b4634;">
                  <tr>
                    <td style="padding-bottom:2px;">${afleverNaam || ''}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:2px;">${afleverStraat || ''}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:2px;">${afleverPostcodePlaats || ''}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:2px;">${afleverLand || ''}</td>
                  </tr>
                  ${
                    order.email
                      ? `<tr><td style="padding-top:6px;">E-mail: ${order.email}</td></tr>`
                      : ''
                  }
                  ${
                    order.telefoon
                      ? `<tr><td>Telefoon: ${order.telefoon}</td></tr>`
                      : ''
                  }
                </table>
              </td>
            </tr>

            <!-- Footer / afsluiting -->
            <tr>
              <td style="padding:16px 24px 24px; background:#faf4e5;">
                <p style="margin:0 0 8px; font-size:13px; color:#7b6450;">
                  Heb je vragen over je bestelling? Reageer op deze e-mail of neem contact met ons op.
                </p>
                <p style="margin:0; font-size:12px; color:#a08b77;">
                  Old Maastricht – De meest rebelse kaas van Nederland.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;

    const textRegels = regels
      .map((r) => {
        const prijsEuro = (r.prijs_cent / 100).toFixed(2).replace('.', ',');
        const regelTotaalEuro = (
          (r.prijs_cent * r.aantal) /
          100
        )
          .toFixed(2)
          .replace('.', ',');
        return `- ${r.aantal} x ${r.product_naam} à € ${prijsEuro} = € ${regelTotaalEuro}`;
      })
      .join('\n');

    const textAdres = [
      afleverNaam || '',
      afleverStraat || '',
      afleverPostcodePlaats || '',
      afleverLand || '',
    ]
      .filter(Boolean)
      .join('\n');

    const text = [
      `Bedankt voor je bestelling bij Old Maastricht, ${tekstKlantnaam}!`,
      '',
      `Bestelnummer: ${orderNummer}`,
      `Totaalbedrag: € ${totaalEuro}`,
      '',
      'Overzicht van je bestelling:',
      textRegels,
      '',
      'Factuur-/afleveradres:',
      textAdres,
      '',
      'Heb je vragen over je bestelling? Neem gerust contact met ons op.',
      '',
      'Old Maastricht – De meest rebelse kaas van Nederland.',
    ].join('\n');

    // 9) Mail versturen met inline logo (CID)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const toAddress =
      order.email ||
      process.env.ORDER_EMAIL ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER;

    // logo inladen uit public/logo.png
    let attachments: any[] = [];
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      const logoContent = fs.readFileSync(logoPath);
      attachments.push({
        filename: 'logo.png',
        content: logoContent,
        cid: 'logo@oldmaastricht',
      });
    } catch (e) {
      console.error('[order/confirm] kon logo niet lezen uit public/logo.png:', e);
    }

    const mailOptions: any = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toAddress,
      subject: `Bestelbevestiging Old Maastricht – ${orderNummer}`,
      text,
      html,
      attachments,
    };

    if (order.email && process.env.ORDER_EMAIL) {
      mailOptions.bcc = process.env.ORDER_EMAIL;
    }

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[order/confirm] error:', err);
    return NextResponse.json(
      {
        error: 'Kon bestelling niet bevestigen.',
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
