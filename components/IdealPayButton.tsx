'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartContext';

export default function IdealPayButton() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (!items.length) {
      setError('Je winkelmand is leeg.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({
            id: it.id,
            name: it.name,
            price: it.price,
            qty: it.qty,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || 'Kon geen iDEAL-betaling starten.');
        setLoading(false);
        return;
      }

      // Redirect naar Stripe Checkout
      window.location.href = data.url as string;
    } catch (e) {
      console.error(e);
      setError('Kon geen iDEAL-betaling starten.');
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: '0.55rem 1.2rem',
          borderRadius: 999,
          border: 'none',
          background: '#168f5c', // iDEAL-ish/groen
          color: '#fff',
          fontWeight: 600,
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        {loading ? 'Verbinding met iDEAL…' : 'Betaal met iDEAL'}
      </button>

      {error && (
        <p style={{ marginTop: '0.5rem', color: '#b00020', fontSize: '0.85rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
