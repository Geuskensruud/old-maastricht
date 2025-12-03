'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Vul je e-mailadres en wachtwoord in.');
      return;
    }

    try {
      setLoading(true);

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        setError('Er ging iets mis. Probeer het later opnieuw.');
        setLoading(false);
        return;
      }

      if (result.error) {
        // Foute combinatie → nette melding
        setError('Onjuiste e-mail / wachtwoord combinatie, probeer het opnieuw.');
        setLoading(false);
        return;
      }

      // Succes → doorsturen
      router.push(result.url ?? '/');
    } catch (err) {
      console.error('[login] error:', err);
      setError('Er ging iets mis. Probeer het later opnieuw.');
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '2.5rem auto',
        padding: '0 1rem',
      }}
    >
      <h1
        style={{
          fontSize: '1.8rem',
          marginBottom: '0.75rem',
          color: '#521f0a',
        }}
      >
        Inloggen
      </h1>

      <p
        style={{
          marginBottom: '1.25rem',
          color: '#5c4940',
          fontSize: '0.95rem',
        }}
      >
        Log in om je account en bestellingen te beheren.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontSize: '0.9rem',
              color: '#5c4940',
            }}
          >
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.6rem',
              borderRadius: 8,
              border: '1px solid #ddd3c5',
            }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              marginBottom: '0.25rem',
              fontSize: '0.9rem',
              color: '#5c4940',
            }}
          >
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.6rem',
              borderRadius: 8,
              border: '1px solid #ddd3c5',
            }}
          />
        </div>

        {error && (
          <p
            style={{
              marginBottom: '0.75rem',
              fontSize: '0.9rem',
              color: '#b00020',
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.55rem 1.2rem',
            borderRadius: 999,
            border: 'none',
            background: '#c28b00',
            color: '#fff',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Inloggen…' : 'Inloggen'}
        </button>
      </form>

      <div
        style={{
          marginTop: '0.9rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          fontSize: '0.9rem',
        }}
      >
        <Link href="/wachtwoord-vergeten" style={{ color: '#521f0a' }}>
          Wachtwoord vergeten?
        </Link>

        <span>
          Nog geen account?{' '}
          <Link href="/register" style={{ color: '#521f0a' }}>
            Maak er één aan.
          </Link>
        </span>
      </div>
    </main>
  );
}
