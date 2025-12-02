import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

type KaasRow = {
  id: string;
  naam: string;
  omschrijving: string | null;
  categorie: string;
  prijs_cent: number;
  afbeelding: string | null;
  actief: boolean;
};

// 🔐 admin-check helper
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userAny = session?.user as any;
  const isAdmin = !!userAny?.isAdmin;

  if (!session || !isAdmin) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Niet toegestaan' }, { status: 403 }),
    };
  }
  return { ok: true as const, session };
}

// GET: lijst kazen
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const result = await db.query<KaasRow>(
      `
      SELECT
        id,
        naam,
        omschrijving,
        categorie,
        prijs_cent,
        afbeelding,
        actief
      FROM kaas
      ORDER BY naam ASC
    `
    );

    const data = result.rows.map((k) => ({
      id: k.id,
      naam: k.naam,
      omschrijving: k.omschrijving,
      categorie: k.categorie,
      prijsCent: k.prijs_cent,
      afbeelding: k.afbeelding,
      actief: k.actief,
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error('[GET /api/admin/kaas] fout:', err);
    return NextResponse.json(
      { error: 'Serverfout bij het ophalen van kazen.' },
      { status: 500 }
    );
  }
}

// POST: kaas toevoegen
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const {
      naam,
      omschrijving,
      categorie,
      prijsEuro,
      afbeelding,
    } = body as {
      naam: string;
      omschrijving?: string;
      categorie: string;
      prijsEuro: number;
      afbeelding?: string;
    };

    if (!naam || !categorie || !prijsEuro || isNaN(prijsEuro)) {
      return NextResponse.json(
        { error: 'Naam, categorie en prijs zijn verplicht.' },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const prijsCent = Math.round(prijsEuro * 100);

    await db.query(
      `
        INSERT INTO kaas (
          id,
          naam,
          omschrijving,
          categorie,
          prijs_cent,
          afbeelding,
          actief,
          aangemaakt_op
        )
        VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
      `,
      [id, naam, omschrijving ?? null, categorie, prijsCent, afbeelding ?? null]
    );

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error('[POST /api/admin/kaas] fout:', err);
    return NextResponse.json(
      { error: 'Serverfout bij het toevoegen van een kaas.' },
      { status: 500 }
    );
  }
}

// PUT: kaas bijwerken
export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const {
      id,
      naam,
      omschrijving,
      categorie,
      prijsEuro,
      afbeelding,
      actief,
    } = body as {
      id: string;
      naam: string;
      omschrijving?: string;
      categorie: string;
      prijsEuro: number;
      afbeelding?: string;
      actief: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: 'id is vereist.' }, { status: 400 });
    }

    if (!naam || !categorie || !prijsEuro || isNaN(prijsEuro)) {
      return NextResponse.json(
        { error: 'Naam, categorie en prijs zijn verplicht.' },
        { status: 400 }
      );
    }

    const prijsCent = Math.round(prijsEuro * 100);

    await db.query(
      `
        UPDATE kaas
        SET
          naam = $2,
          omschrijving = $3,
          categorie = $4,
          prijs_cent = $5,
          afbeelding = $6,
          actief = $7
        WHERE id = $1
      `,
      [id, naam, omschrijving ?? null, categorie, prijsCent, afbeelding ?? null, actief]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/admin/kaas] fout:', err);
    return NextResponse.json(
      { error: 'Serverfout bij het bijwerken van een kaas.' },
      { status: 500 }
    );
  }
}

// DELETE: kaas verwijderen
export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = await req.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: 'id is vereist.' }, { status: 400 });
    }

    await db.query('DELETE FROM kaas WHERE id = $1', [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/admin/kaas] fout:', err);
    return NextResponse.json(
      { error: 'Serverfout bij het verwijderen van een kaas.' },
      { status: 500 }
    );
  }
}
