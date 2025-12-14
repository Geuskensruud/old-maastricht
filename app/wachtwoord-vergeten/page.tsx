'use client';

import { FormEvent, useState } from 'react';

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Er ging iets mis, probeer het opnieuw.');
      } else {
        setMessage(
          'Als dit e-mailadres bij ons bekend is, hebben we een e-mail gestuurd met een link om je wachtwoord te resetten.'
        );
      }
    } catch (err) {
      console.error(err);
      setError('Er ging iets mis, probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '2rem auto',
        padding: '0 1rem',
      }}
    >
      <h1
        style={{
          fontSize: '1.6rem',
          marginBottom: '0.75rem',
          color: '#521f0a',
        }}
      >
        Wachtwoord resetten
      </h1>
      <p style={{ marginBottom: '1rem' }}>
        Vul je e-mailadres in. Als het bij ons bekend is, sturen we je een link
        om een nieuw wachtwoord in te stellen.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label htmlFor="email">E-mailadres</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '0.5rem 0.6rem',
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            padding: '0.55rem 1.2rem',
            borderRadius: 4,
            border: 'none',
            background: '#521f0a',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Versturen…' : 'Stuur reset-link'}
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: '1rem',
            color: 'green',
            fontSize: '0.95rem',
          }}
        >
          {message}
        </p>
      )}

      {error && (
        <p
          style={{
            marginTop: '1rem',
            color: 'darkred',
            fontSize: '0.95rem',
          }}
        >
          {error}
        </p>
      )}
    </main>
  );
}
