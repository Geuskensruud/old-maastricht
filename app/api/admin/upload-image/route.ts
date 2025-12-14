// app/api/admin/upload-image/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'Geen bestand ontvangen.' },
        { status: 400 }
      );
    }

    const mime = file.type || 'application/octet-stream';
    if (!mime.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Alleen afbeeldingsbestanden zijn toegestaan.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const id = crypto.randomUUID();

    await db.query(
      `
        INSERT INTO kaas_afbeeldingen (id, data, mime_type)
        VALUES ($1, $2, $3)
      `,
      [id, buffer, mime]
    );

    // URL die we in de kaas.afbeelding kolom kunnen zetten
    const url = `/api/kaas-afbeelding/${id}`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[admin/upload-image] error:', err);
    return NextResponse.json(
      { error: 'Uploaden van afbeelding mislukt.' },
      { status: 500 }
    );
  }
}
