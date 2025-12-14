// app/api/kaas-afbeelding/[id]/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Let op: context als any, omdat Next in nieuwe versies params als Promise geeft
export async function GET(_req: Request, context: any) {
  // In de nieuwe runtime is params een Promise
  const { id } = await context.params;

  try {
    const result = await db.query<{ data: any; mime_type: string }>(
      `
        SELECT data, mime_type
        FROM kaas_afbeeldingen
        WHERE id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return new NextResponse('Niet gevonden', { status: 404 });
    }

    const row = result.rows[0];

    // pg geeft hier normaal een Buffer terug; casten naar Uint8Array voor NextResponse
    const uint8 = new Uint8Array(row.data as Buffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': row.mime_type,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('[kaas-afbeelding] error:', err);
    return new NextResponse('Serverfout', { status: 500 });
  }
}
