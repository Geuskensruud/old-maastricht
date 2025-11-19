'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function WinkelmandPage() {
  const { items, total, removeItem, clear, addItem } = useCart();

  const format = (v: number) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(v);

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Winkelmand</h1>

      {items.length === 0 ? (
        <div style={{ background: '#fffef8', border: '1px solid #eee', padding: '1rem', borderRadius: 12 }}>
          <p>Je winkelmand is leeg.</p>
          <p style={{ marginTop: '0.5rem' }}>
            Ga naar de <Link href="/shop" style={{ color: '#c28b00', fontWeight: 600 }}>shop</Link> om producten toe te voegen.
          </p>
        </div>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((it) => (
              <li
                key={it.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '1rem',
                  alignItems: 'center',
                  borderBottom: '1px solid #eee',
                  padding: '0.75rem 0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{it.name}</div>
                  <div style={{ color: '#666', fontSize: '.9rem' }}>{format(it.price)}</div>
                </div>

                <div style={{ textAlign: 'right' }}>x {it.qty}</div>

                <div style={{ textAlign: 'right', fontWeight: 600 }}>
                  {format(it.price * it.qty)}
                </div>

                <div style={{ display: 'flex', gap: '.5rem' }}>
                  
                  <button
                    onClick={() => {
                      if (it.qty > 1) {
                        addItem({ id: it.id, name: it.name, price: it.price }, -1);
                      } else {
                        removeItem(it.id);
                      }
                    }}
                    style={{
                      border: '1px solid #ddd',
                      background: '#fff',
                      padding: '.35rem .6rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                    aria-label={`${it.name} -1`}
                  >
                    -1
                  </button>

                  <button
                    onClick={() =>
                      addItem({ id: it.id, name: it.name, price: it.price }, 1)
                    }
                    style={{
                      border: '1px solid #ddd',
                      background: '#fff',
                      padding: '.35rem .6rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                    aria-label={`${it.name} +1`}
                  >
                    +1
                  </button>

                  <button
                    onClick={() => removeItem(it.id)}
                    style={{
                      border: '1px solid #ddd',
                      background: '#fff',
                      padding: '.35rem .6rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                    aria-label={`${it.name} verwijderen`}
                  >
                    Verwijderen
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center' }}>
            <button
              onClick={clear}
              style={{ border: '1px solid #ddd', background: '#fff', padding: '.6rem .9rem', borderRadius: 10, cursor: 'pointer' }}
            >
              Mandje leegmaken
            </button>

            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Totaal: {format(total)}
            </div>
          </div>

          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <a
              href="/afrekenen"
              style={{
                background: '#c28b00',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                padding: '.75rem 1.1rem',
                borderRadius: 12,
                textDecoration: 'none',
              }}
            >
              Afrekenen
            </a>
          </div>
        </>
      )}
    </section>
  );
}
