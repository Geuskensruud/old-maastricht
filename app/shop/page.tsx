'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS, Product } from '@/components/products';
import './Shop.css';

const CATEGORIES: Array<Product['category'] | 'Alles'> = [
  'Alles', 'Harde kazen', 'Zachte kazen', 'Geiten/Schapen', 'Specials'
];

export default function ShopPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('Alles');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(p => {
      const matchCat = category === 'Alles' ? true : p.category === category;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false);
      return matchCat && matchQ;
    });
  }, [query, category]);

  return (
    <section className="shop-wrap">
      <div className="shop-header">
        <h1 className="shop-title">Shop</h1>
        <div className="shop-filters">
          <select
            className="shop-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            aria-label="Filter op categorie"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            className="shop-search"
            type="search"
            placeholder="Zoek een kaas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Zoek in producten"
          />
        </div>
      </div>

      <div className="shop-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {filtered.length === 0 && (
          <p style={{ gridColumn: '1/-1', color: '#666' }}>
            Geen producten gevonden. Probeer een andere zoekterm of categorie.
          </p>
        )}
      </div>
    </section>
  );
}
