import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, wachtwoord } = await req.json();

    if (!email || !wachtwoord) {
      return NextResponse.json({ error: 'Ontbrekende gegevens' }, { status: 400 });
    }
    if (String(wachtwoord).length < 6) {
      return NextResponse.json({ error: 'Wachtwoord te kort' }, { status: 400 });
    }

    // Demo: altijd succes
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 });
  }
}
