// app/api/order/confirm/route.ts
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import nodemailer from 'nodemailer';
import path from 'path';

function formatEuro(amount: number): string {
  return amount.toFixed(2).replace('.', ',');
}

type ViewLineItem = {
  name: string;
  qty: number;
  totalEuro: number;
  unitEuro: number;
};

export async function POST(req: Request) {
  try {
    const { sessionId } = (await req.json()) as { sessionId?: string };

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId ontbreekt.' },
        { status: 400 }
      );
    }

    // Stripe sessie ophalen
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    const email = session.customer_details?.email;
    if (!email) {
      return NextResponse.json(
        { error: 'Geen e-mailadres gevonden voor deze sessie.' },
        { status: 200 }
      );
    }

    const rawLineItems = (session.line_items?.data ?? []) as any[];

    const lineItems: ViewLineItem[] = rawLineItems.map((li: any) => {
      const name: string = li.description ?? 'Product';
      const qty: number = li.quantity ?? 1;
      const totalEuro: number = (li.amount_total ?? 0) / 100;
      const unitEuro: number = qty > 0 ? totalEuro / qty : totalEuro;
      return { name, qty, totalEuro, unitEuro };
    });

    const totalEuro: number =
      typeof session.amount_total === 'number'
        ? session.amount_total / 100
        : lineItems.reduce(
            (sum: number, li: ViewLineItem) => sum + li.totalEuro,
            0
          );

    const md = session.metadata || {};
    const voornaam = md.voornaam || '';
    const achternaam = md.achternaam || '';
    const bedrijfsnaam = md.bedrijfsnaam || '';
    const telefoon = md.telefoon || '';

    const factuurStraat = md.factuur_straat || '';
    const factuurPostcode = md.factuur_postcode || '';
    const factuurPlaats = md.factuur_plaats || '';
    const factuurLand = md.factuur_land || '';

    const verzendStraat = md.verzend_straat || factuurStraat;
    const verzendPostcode = md.verzend_postcode || factuurPostcode;
    const verzendPlaats = md.verzend_plaats || factuurPlaats;
    const verzendLand = md.verzend_land || factuurLand;

    const bestelnotities = md.bestelnotities || '';

    const textLines = [
      `Bedankt voor je bestelling${voornaam ? `, ${voornaam}` : ''}!`,
      '',
      'We hebben je bestelling ontvangen en gaan ermee aan de slag. Hier is een overzicht:',
      '',
      ...lineItems.map(
        (li: ViewLineItem) =>
          `- ${li.name} x ${li.qty} — € ${formatEuro(li.totalEuro)}`
      ),
      '',
      `Totaal: € ${formatEuro(totalEuro)}`,
      '',
      'We gaan zo snel mogelijk met je bestelling aan de slag.',
    ];

    const logoCid = 'logo-old-maastricht';
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');

    const htmlEmail = `
<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charSet="UTF-8" />
    <title>Bestelbevestiging - Old Maastricht</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f1e8;">
    <table width="100%" cellPadding="0" cellSpacing="0" style="border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:16px 8px;">
          <table width="600" cellPadding="0" cellSpacing="0" style="border-collapse:collapse;background:#ffffff;border-radius:8px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#3a2a23;">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #f0e0b0;background:#fff7e0;">
                <table width="100%" cellPadding="0" cellSpacing="0" style="border-collapse:collapse;">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <img
                        src="cid:${logoCid}"
                        alt="Old Maastricht"
                        style="max-height:48px;width:auto;display:block;"
                      />
                    </td>
                    <td align="right" style="vertical-align:middle;font-size:13px;font-weight:600;color:#c28b00;">
                      Bestelbevestiging
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 24px 22px;">
                <h1 style="margin:0 0 4px;font-size:20px;color:#000;">
                  Bedankt voor je bestelling${
                    voornaam || achternaam
                      ? `, ${[voornaam, achternaam].filter(Boolean).join(' ')}`
                      : ''
                  }!
                </h1>
                <p style="margin:0 0 14px;font-size:13px;color:#555;line-height:1.5;">
                  We hebben je bestelling ontvangen en gaan ermee aan de slag. Hier is een overzicht:
                </p>

                <table width="100%" cellPadding="0" cellSpacing="0" style="border-collapse:collapse;font-size:13px;margin-top:8px;">
                  <thead>
                    <tr>
                      <th align="left" style="padding:8px 0;border-bottom:1px solid #e3e3e3;font-size:11px;font-weight:700;text-transform:uppercase;color:#777;">
                        Product
                      </th>
                      <th align="right" style="padding:8px 0;border-bottom:1px solid #e3e3e3;font-size:11px;font-weight:700;text-transform:uppercase;color:#777;">
                        Prijs
                      </th>
                      <th align="center" style="padding:8px 0;border-bottom:1px solid #e3e3e3;font-size:11px;font-weight:700;text-transform:uppercase;color:#777;">
                        Aantal
                      </th>
                      <th align="right" style="padding:8px 0;border-bottom:1px solid #e3e3e3;font-size:11px;font-weight:700;text-transform:uppercase;color:#777;">
                        Totaal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    ${lineItems
                      .map(
                        (li: ViewLineItem) => `
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f2f2f2;">
                          ${li.name}
                        </td>
                        <td align="right" style="padding:8px 0;border-bottom:1px solid #f2f2f2;white-space:nowrap;">
                          € ${formatEuro(li.unitEuro)}
                        </td>
                        <td align="center" style="padding:8px 0;border-bottom:1px solid #f2f2f2;">
                          x ${li.qty}
                        </td>
                        <td align="right" style="padding:8px 0;border-bottom:1px solid #f2f2f2;white-space:nowrap;">
                          € ${formatEuro(li.totalEuro)}
                        </td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" align="right" style="padding:10px 0 4px;font-weight:700;">
                        Totaal
                      </td>
                      <td align="right" style="padding:10px 0 4px;font-weight:700;white-space:nowrap;">
                        € ${formatEuro(totalEuro)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <table width="100%" cellPadding="0" cellSpacing="0" style="border-collapse:collapse;margin-top:18px;font-size:13px;">
                  <tr>
                    <td valign="top" style="width:50%;padding-right:8px;">
                      <div style="font-weight:700;margin-bottom:4px;">Factuuradres</div>
                      <div>
                        ${[voornaam, achternaam].filter(Boolean).join(' ')}<br/>
                        ${bedrijfsnaam ? `Bedrijfsnaam: ${bedrijfsnaam}<br/>` : ''}
                        E-mail: ${email}<br/>
                        ${telefoon ? `Telefoon: ${telefoon}<br/>` : ''}
                        Adres: ${
                          [
                            factuurStraat,
                            `${factuurPostcode} ${factuurPlaats}`.trim(),
                            factuurLand,
                          ]
                            .filter(Boolean)
                            .join(', ')
                        }<br/>
                        ${
                          bestelnotities
                            ? `Notities: <span style="white-space:pre-line;">${bestelnotities}</span>`
                            : ''
                        }
                      </div>
                    </td>
                    <td valign="top" style="width:50%;padding-left:8px;">
                      <div style="font-weight:700;margin-bottom:4px;">Verzendadres</div>
                      <div>
                        ${
                          verzendStraat === factuurStraat &&
                          verzendPostcode === factuurPostcode &&
                          verzendPlaats === factuurPlaats &&
                          verzendLand === factuurLand
                            ? 'Gelijk aan factuuradres'
                            : `${[voornaam, achternaam]
                                .filter(Boolean)
                                .join(' ')}<br/>
                               Adres: ${
                                 [
                                   verzendStraat,
                                   `${verzendPostcode} ${verzendPlaats}`.trim(),
                                   verzendLand,
                                 ]
                                   .filter(Boolean)
                                   .join(', ')
                               }`
                        }
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin-top:18px;font-size:12px;color:#666;line-height:1.5;">
                  Vragen? Reageer op deze e-mail of bel ons. Bedankt dat je voor Kaashandel Old Maastricht hebt gekozen!
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:10px 16px 14px;border-top:1px solid #f0e0b0;background:#fff7e0;font-size:11px;color:#7b6c5e;text-align:center;">
                © ${new Date().getFullYear()} Kaashandel Old Maastricht — Alle rechten voorbehouden
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;

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
      subject: 'Bestelbevestiging - Old Maastricht',
      text: textLines.join('\n'),
      html: htmlEmail,
      attachments: [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: logoCid,
        },
      ],
    });

    if (process.env.ORDER_NOTIFY_EMAIL) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.ORDER_NOTIFY_EMAIL,
        subject: 'Nieuwe bestelling - Old Maastricht',
        text: `Nieuwe bestelling van ${email}\n\n${textLines.join('\n')}`,
        html: `<p>Nieuwe bestelling van <strong>${email}</strong></p>${htmlEmail}`,
        attachments: [
          {
            filename: 'logo.png',
            path: logoPath,
            cid: logoCid,
          },
        ],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[order/confirm] error:', err);
    return NextResponse.json(
      { error: 'Kon bevestigingsmail niet versturen.' },
      { status: 500 }
    );
  }
}
