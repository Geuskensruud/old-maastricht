import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

type Body = {
  email: string;
  voornaam: string;
  achternaam: string;
  telefoon: string;
  producten: { name: string; qty: number; price: number }[];
  totaal: number;
  factuuradres?: {
    voornaam: string;
    achternaam: string;
    bedrijfsnaam?: string;
    email: string;
    telefoon: string;
    land: string;
    straat: string;
    postcode: string;
    plaats: string;
    bestelnotities?: string;
  };
  verzendadres?: {
    land: string;
    straat: string;
    postcode: string;
    plaats: string;
  } | null;
};

// € formatter (node heeft Intl aan boord)
function formatEUR(v: number) {
  try {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(v);
  } catch {
    // eenvoudige fallback
    return `€${v.toFixed(2).replace('.', ',')}`;
  }
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// HTML e-mail (inline CSS voor brede client support)
function buildHtml(
  shopName: string,
  logoCid: string | null,
  data: Body
) {
  const { voornaam, achternaam, producten, totaal, factuuradres, verzendadres } = data;

  const rows = producten.map(p => `
    <tr>
      <td style="padding:12px 10px;border-bottom:1px solid #eee;">${escapeHtml(p.name)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #eee;">${formatEUR(p.price)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #eee;">x ${p.qty}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #eee;text-align:right;"><strong>${formatEUR(p.price * p.qty)}</strong></td>
    </tr>
  `).join('');

  const factuurblok = factuuradres ? `
    <table role="presentation" width="100%" style="border-collapse:collapse">
      <tr><td style="padding:2px 0"><strong>Naam:</strong> ${escapeHtml(factuuradres.voornaam)} ${escapeHtml(factuuradres.achternaam)}</td></tr>
      ${factuuradres.bedrijfsnaam ? `<tr><td style="padding:2px 0"><strong>Bedrijfsnaam:</strong> ${escapeHtml(factuuradres.bedrijfsnaam)}</td></tr>` : ''}
      <tr><td style="padding:2px 0"><strong>E-mail:</strong> ${escapeHtml(factuuradres.email)}</td></tr>
      <tr><td style="padding:2px 0"><strong>Telefoon:</strong> ${escapeHtml(factuuradres.telefoon)}</td></tr>
      <tr><td style="padding:2px 0"><strong>Adres:</strong> ${escapeHtml(factuuradres.straat)}, ${escapeHtml(factuuradres.postcode)} ${escapeHtml(factuuradres.plaats)}, ${escapeHtml(factuuradres.land)}</td></tr>
      ${factuuradres.bestelnotities ? `<tr><td style="padding:2px 0"><strong>Notities:</strong> ${escapeHtml(factuuradres.bestelnotities)}</td></tr>` : ''}
    </table>
  ` : '';

  const verzendblok = verzendadres ? `
    <table role="presentation" width="100%" style="border-collapse:collapse">
      <tr><td style="padding:2px 0"><strong>Adres:</strong> ${escapeHtml(verzendadres.straat)}, ${escapeHtml(verzendadres.postcode)} ${escapeHtml(verzendadres.plaats)}, ${escapeHtml(verzendadres.land)}</td></tr>
    </table>
  ` : '<p style="margin:0;color:#555">Gelijk aan factuuradres</p>';

  return `
  <!doctype html>
  <html lang="nl">
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>Bestelbevestiging</title>
    </head>
    <body style="margin:0;background:#f6f7f9;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;color:#222;">
      <table role="presentation" width="100%" style="border-collapse:collapse;background:#f6f7f9;padding:20px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="620" style="border-collapse:collapse;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eaeaea;">
              <tr>
                <td style="background:#fffef8;border-bottom:1px solid #eee;padding:18px 24px;display:flex;align-items:center;gap:12px">
                  ${logoCid ? `<img src="cid:${logoCid}" alt="${escapeHtml(shopName)}" width="140" style="display:block;height:auto" />` : `<strong style="font-size:20px">${escapeHtml(shopName)}</strong>`}
                  <div style="margin-left:auto;font-weight:700;color:#c28b00;">Bestelbevestiging</div>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 24px">
                  <h1 style="margin:0 0 8px;font-size:20px;">Bedankt voor je bestelling, ${escapeHtml(voornaam)} ${escapeHtml(achternaam)}!</h1>
                  <p style="margin:0 0 16px;color:#555">We hebben je bestelling ontvangen en gaan ermee aan de slag. Hier is een overzicht:</p>

                  <table role="presentation" width="100%" style="border-collapse:collapse;margin:10px 0 16px">
                    <thead>
                      <tr style="background:#fafafa;border-bottom:1px solid #eee;">
                        <th align="left" style="padding:10px;font-size:13px;color:#555;text-transform:uppercase;letter-spacing:.4px;">Product</th>
                        <th align="left" style="padding:10px;font-size:13px;color:#555;text-transform:uppercase;letter-spacing:.4px;">Prijs</th>
                        <th align="left" style="padding:10px;font-size:13px;color:#555;text-transform:uppercase;letter-spacing:.4px;">Aantal</th>
                        <th align="right" style="padding:10px;font-size:13px;color:#555;text-transform:uppercase;letter-spacing:.4px;">Totaal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${rows}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" style="padding:12px 10px;text-align:right;color:#444;border-top:2px solid #eee;"><strong>Totaal</strong></td>
                        <td style="padding:12px 10px;text-align:right;border-top:2px solid #eee;"><strong style="font-size:16px">${formatEUR(totaal)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>

                  <table role="presentation" width="100%" style="border-collapse:collapse;margin-top:10px">
                    <tr>
                      <td width="50%" style="vertical-align:top;padding-right:8px">
                        <h3 style="margin:0 0 6px;font-size:16px;">Factuuradres</h3>
                        ${factuurblok}
                      </td>
                      <td width="50%" style="vertical-align:top;padding-left:8px">
                        <h3 style="margin:0 0 6px;font-size:16px;">Verzendadres</h3>
                        ${verzendblok}
                      </td>
                    </tr>
                  </table>

                  <p style="margin:18px 0 0;color:#555">Vragen? Reageer op deze e-mail of bel ons. Bedankt dat je voor ${escapeHtml(shopName)} hebt gekozen!</p>
                </td>
              </tr>

              <tr>
                <td style="background:#fffef8;border-top:1px solid #eee;padding:14px 24px;color:#777;font-size:12px;text-align:center">
                  © ${new Date().getFullYear()} ${escapeHtml(shopName)} — Alle rechten voorbehouden
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

// Plain-text fallback
function buildText(shopName: string, data: Body) {
  const lines: string[] = [];
  lines.push(`Bedankt voor je bestelling bij ${shopName}, ${data.voornaam} ${data.achternaam}!`);
  lines.push('');
  lines.push('Besteloverzicht:');
  for (const p of data.producten) {
    lines.push(`- ${p.name} — ${p.qty} x ${formatEUR(p.price)} = ${formatEUR(p.price * p.qty)}`);
  }
  lines.push(`Totaal: ${formatEUR(data.totaal)}`);
  lines.push('');
  if (data.factuuradres) {
    const f = data.factuuradres;
    lines.push('Factuuradres:');
    lines.push(`${f.voornaam} ${f.achternaam}`);
    if (f.bedrijfsnaam) lines.push(f.bedrijfsnaam);
    lines.push(`${f.straat}`);
    lines.push(`${f.postcode} ${f.plaats}`);
    lines.push(`${f.land}`);
    lines.push(`E-mail: ${f.email}`);
    lines.push(`Tel: ${f.telefoon}`);
    if (f.bestelnotities) { lines.push(`Notities: ${f.bestelnotities}`); }
    lines.push('');
  }
  if (data.verzendadres) {
    const s = data.verzendadres;
    lines.push('Verzendadres:');
    lines.push(`${s.straat}`);
    lines.push(`${s.postcode} ${s.plaats}`);
    lines.push(`${s.land}`);
    lines.push('');
  } else {
    lines.push('Verzendadres: gelijk aan factuuradres');
    lines.push('');
  }
  lines.push('Met vriendelijke groet,');
  lines.push(shopName);
  return lines.join('\n');
}

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Body;

    const shopName = 'Kaashandel Old Maastricht';

    // === SMTP transporter ===
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });

    // === Logo als CID-attachment (optioneel) ===
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const hasLogo = fs.existsSync(logoPath);
    const logoCid = hasLogo ? 'shop-logo@cid' : null;

    const html = buildHtml(shopName, logoCid, data);
    const text = buildText(shopName, data);

    // Verzend e-mail naar klant (en BCC naar winkel)
    await transporter.sendMail({
      from: `"${shopName}" <${process.env.SMTP_USER}>`,
      to: data.email,
      // kopie naar de winkel (pas aan / verwijder BCC als je dat niet wilt)
      bcc: process.env.SMTP_USER,
      subject: 'Bevestiging van je bestelling',
      text,
      html,
      attachments: hasLogo
        ? [{ filename: 'logo.png', path: logoPath, cid: logoCid! }]
        : [],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Mailfout:', err);
    return NextResponse.json(
      { success: false, error: 'Mail kon niet worden verzonden' },
      { status: 500 }
    );
  }
}
