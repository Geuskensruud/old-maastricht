// app/wachtwoord-vergeten/page.tsx
'use client';

import { FormEvent, useState } from 'react';

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    try {
      setStatus('loading');
      setMessage(null);
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setMessage(data.error || 'Er ging iets mis. Probeer het later opnieuw.');
        return;
      }

      setStatus('done');
      setMessage(
        'Als dit e-mailadres bij ons bekend is, hebben we een e-mail gestuurd met verdere instructies.'
      );
    } catch {
      setStatus('error');
      setMessage('Er ging iets mis. Probeer het later opnieuw.');
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '0.75rem' }}>Wachtwoord vergeten</h1>
      <p style={{ marginBottom: '1rem' }}>
        Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord in te stellen.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
          E-mailadres
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {status === 'loading' ? 'Verzenden…' : 'Verzend reset-link'}
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
