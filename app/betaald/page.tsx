// app/betaald/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BetaaldPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 15000); // 15 seconden

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main
      style={{
        maxWidth: 600,
        margin: '2rem auto',
        padding: '0 1rem',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          marginBottom: '1rem',
          color: '#521f0a',
        }}
      >
        Bedankt voor je bestelling!
      </h1>

      <p style={{ marginBottom: '0.75rem' }}>
        We hebben je betaling succesvol ontvangen. Je ontvangt zo meteen een
        bevestiging per e-mail.
      </p>

      <p style={{ marginBottom: '1.5rem' }}>
        Je wordt automatisch teruggestuurd naar de homepagina.
      </p>

      <button
        type="button"
        onClick={() => router.push('/')}
        style={{
          backgroundColor: '#521f0a',
          color: '#fff',
          border: '1px solid #f3e0c2',
          borderRadius: '6px',        // zelfde idea als Maps-knop
          padding: '0.45rem 1rem',
          fontWeight: 600,
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.16)',
        }}
      >
        Terug naar home
      </button>
    </main>
  );
}
