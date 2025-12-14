'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function WachtwoordResettenPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
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
        <p>Ongeldige of ontbrekende reset-link.</p>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== password2) {
      setError('De wachtwoorden komen niet overeen.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Het wachtwoord moet minstens 6 tekens bevatten.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Wachtwoord resetten is niet gelukt.');
      } else {
        setMessage('Je wachtwoord is aangepast. Je kunt nu inloggen met je nieuwe wachtwoord.');
        setPassword('');
        setPassword2('');
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
        Nieuw wachtwoord instellen
      </h1>
      <p style={{ marginBottom: '1rem' }}>
        Kies een nieuw wachtwoord voor je account.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label htmlFor="password">Nieuw wachtwoord</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '0.5rem 0.6rem',
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
          />
        </div>

        <div style={{ display: 'grid', gap: '0.25rem' }}>
          <label htmlFor="password2">Herhaal nieuw wachtwoord</label>
          <input
            id="password2"
            type="password"
            required
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
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
          {loading ? 'Opslaan…' : 'Wachtwoord opslaan'}
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
