// app/wachtwoord-resetten/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function WachtwoordResettenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  if (!token) {
    return (
      <main style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Wachtwoord resetten</h1>
        <p>Geen geldige reset-link gevonden.</p>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!password || password !== password2) {
      setMessage('Wachtwoorden komen niet overeen.');
      return;
    }

    try {
      setStatus('loading');
      setMessage(null);

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Resetten van het wachtwoord is mislukt.');
        return;
      }

      setStatus('done');
      setMessage('Je wachtwoord is aangepast. Je kunt nu inloggen.');
      // optioneel auto-redirect na paar seconden:
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setStatus('error');
      setMessage('Resetten van het wachtwoord is mislukt.');
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '0.75rem' }}>Nieuw wachtwoord instellen</h1>
      <p style={{ marginBottom: '1rem' }}>
        Kies een nieuw wachtwoord voor je account.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
          Nieuw wachtwoord
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.6rem',
            borderRadius: 8,
            border: '1px solid #ddd3c5',
            marginBottom: '0.75rem',
          }}
        />

        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
          Herhaal nieuw wachtwoord
        </label>
        <input
          type="password"
          required
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.6rem',
            borderRadius: 8,
            border: '1px solid #ddd3c5',
            marginBottom: '0.75rem',
          }}
        />

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 999,
            border: 'none',
            background: '#c28b00',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {status === 'loading' ? 'Opslaan…' : 'Wachtwoord opslaan'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
          {message}
        </p>
      )}
    </main>
  );
}
