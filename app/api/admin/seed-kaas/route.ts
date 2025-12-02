import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { PRODUCTS } from '@/components/products';

// Pas deze type eventueel aan naar jouw daadwerkelijke Product-type
type Product = {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;   // in euro's
  image?: string;
};

export async function GET() {
  // Alleen admins
  const session = await getServerSession(authOptions);
  const userAny = session?.user as any;
  const isAdmin = !!userAny?.isAdmin;

  if (!session || !isAdmin) {
    return NextResponse.json({ error: 'Niet toegestaan' }, { status: 403 });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    for (const p of PRODUCTS as Product[]) {
      const prijsCent = Math.round((p.price ?? 0) * 100);

      await client.query(
        `
          INSERT INTO kaas (
            id,
            naam,
            omschrijving,
            categorie,
            prijs_cent,
            afbeelding,
            actief
          )
          VALUES ($1, $2, $3, $4, $5, $6, TRUE)
          ON CONFLICT (id) DO UPDATE SET
            naam         = EXCLUDED.naam,
            omschrijving = EXCLUDED.omschrijving,
            categorie    = EXCLUDED.categorie,
            prijs_cent   = EXCLUDED.prijs_cent,
            afbeelding   = EXCLUDED.afbeelding,
            actief       = EXCLUDED.actief
        `,
        [
          p.id,
          p.name,
          p.description ?? null,
          p.category,
          prijsCent,
          p.image ?? null,
        ]
      );
    }

    await client.query('COMMIT');

    return NextResponse.json({
      ok: true,
      count: (PRODUCTS as Product[]).length,
      message: 'Kazen uit PRODUCTS naar tabel "kaas" geschreven.',
    });
  } catch (err) {
    console.error('[seed-kaas] fout:', err);
    await client.query('ROLLBACK');
    return NextResponse.json(
      { error: 'Er is iets misgegaan bij het seeden van de kazen.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
