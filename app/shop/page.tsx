// app/shop/page.tsx
import db from '@/lib/db';
import ShopClient from '@/components/ShopClient';
import type { Product } from '@/components/products';
import './Shop.css';

// Helper om categorie uit de DB naar een geldige union te mappen
function mapCategory(raw: string): Product['category'] {
  switch (raw) {
    case 'Harde kazen':
      return 'Harde kazen';
    case 'Zachte kazen':
      return 'Zachte kazen';
    case 'Geiten/Schapen':
      return 'Geiten/Schapen';
    case 'Specials':
      return 'Specials';
    default:
      // fallback, mocht er een onbekende categorie in de DB staan
      return 'Specials';
  }
}

export default async function ShopPage() {
  const result = await db.query<{
    id: string;
    naam: string;
    omschrijving: string | null;
    categorie: string;
    prijs_cent: number;
    afbeelding: string | null;
    actief: boolean;
  }>(
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
      WHERE actief = TRUE
      ORDER BY naam ASC
    `
  );

  const products: Product[] = result.rows.map((row) => ({
    id: row.id,
    name: row.naam,
    description: row.omschrijving ?? '',
    category: mapCategory(row.categorie),
    price: row.prijs_cent / 100,
    image: row.afbeelding ?? '/icons/cheese.png',
  }));

  return <ShopClient initialProducts={products} />;
}
