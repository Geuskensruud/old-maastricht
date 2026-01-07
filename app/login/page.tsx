// app/login/page.tsx
'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        // Altijd dezelfde tekst tonen, geen technische errorstring
        setError('Onjuiste e-mail / wachtwoord combinatie. Probeer het opnieuw.');
        setLoading(false);
        return;
      }

      // Succesvol ingelogd → naar home en sessie refreshen
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('[login] error:', err);
      setError('Er ging iets mis tijdens het inloggen. Probeer het later opnieuw.');
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 420,
        margin: '3rem auto',
        padding: '0 1rem',
      }}
    >
      <section
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
          padding: '1.75rem 1.5rem 1.5rem',
          border: '1px solid #f0e2c9',
        }}
      >
        <h1
          style={{
            fontSize: '1.6rem',
            marginBottom: '0.25rem',
            color: '#521f0a',
          }}
        >
          Inloggen
        </h1>
        <p
          style={{
            margin: '0 0 1.25rem',
            fontSize: '0.95rem',
            color: '#6a5543',
          }}
        >
          Log in om je gegevens en bestellingen te beheren.
        </p>

        {error && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.7rem 0.9rem',
              borderRadius: 8,
              background: '#ffe5e5',
              color: '#7a1b1b',
              fontSize: '0.9rem',
              border: '1px solid #f3b5b5',
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '0.9rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '0.3rem',
                color: '#3a2818',
              }}
            >
              E-mail
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
                padding: '0.55rem 0.7rem',
                borderRadius: 8,
                border: '1px solid #ddc9a6',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '0.3rem',
                color: '#3a2818',
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
                padding: '0.55rem 0.7rem',
                borderRadius: 8,
                border: '1px solid #ddc9a6',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#521f0a',
              color: '#fff',
              border: '1px solid #f3e0c2',
              borderRadius: 6,
              padding: '0.55rem 1rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: loading ? 'default' : 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.16)',
              opacity: loading ? 0.85 : 1,
            }}
          >
            {loading ? 'Bezig met inloggen…' : 'Inloggen'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.2rem',
            fontSize: '0.9rem',
            color: '#6a5543',
          }}
        >
          Nog geen account?{' '}
          <Link
            href="/register"
            style={{
              color: '#521f0a',
              fontWeight: 600,
              textDecoration: 'underline',
              textDecorationThickness: '1px',
            }}
          >
            Maak er één aan.
          </Link>
        </div>
      </section>
    </main>
  );
}
