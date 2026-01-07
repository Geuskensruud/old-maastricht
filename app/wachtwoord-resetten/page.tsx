// app/wachtwoord-resetten/page.tsx
'use client';

import { FormEvent, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function WachtwoordResettenInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Ongeldige of ontbrekende resetlink. Probeer opnieuw via "Wachtwoord vergeten".');
      return;
    }

    if (!password || !passwordRepeat) {
      setError('Vul beide wachtwoordvelden in.');
      return;
    }

    if (password !== passwordRepeat) {
      setError('De wachtwoorden komen niet overeen.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          data.error ||
            'Het resetten van het wachtwoord is mislukt. De link kan verlopen of ongeldig zijn.'
        );
        setLoading(false);
        return;
      }

      setSuccess('Je wachtwoord is succesvol aangepast. Je wordt zo doorgestuurd naar de loginpagina.');
      setLoading(false);

      // Na een paar seconden naar login
      setTimeout(() => {
        router.push('/login');
      }, 4000);
    } catch (err) {
      console.error('[wachtwoord-resetten] error:', err);
      setError('Er ging iets mis tijdens het resetten. Probeer het later opnieuw.');
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
          Wachtwoord resetten
        </h1>
        <p
          style={{
            margin: '0 0 1.25rem',
            fontSize: '0.95rem',
            color: '#6a5543',
          }}
        >
          Kies een nieuw wachtwoord voor je account.
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

        {success && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.7rem 0.9rem',
              borderRadius: 8,
              background: '#e4f6e8',
              color: '#1b5a2b',
              fontSize: '0.9rem',
              border: '1px solid #b3e0c0',
            }}
            role="status"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '0.9rem' }}>
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
              Nieuw wachtwoord
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
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

          <div style={{ marginBottom: '1.1rem' }}>
            <label
              htmlFor="passwordRepeat"
              style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '0.3rem',
                color: '#3a2818',
              }}
            >
              Herhaal nieuw wachtwoord
            </label>
            <input
              id="passwordRepeat"
              type="password"
              autoComplete="new-password"
              required
              value={passwordRepeat}
              onChange={(e) => setPasswordRepeat(e.target.value)}
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
            {loading ? 'Bezig met resetten…' : 'Wachtwoord wijzigen'}
          </button>
        </form>
      </section>
    </main>
  );
}

// ⬅️ Belangrijk: useSearchParams zit binnen Suspense
export default function WachtwoordResettenPage() {
  return (
    <Suspense
      fallback={
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
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, color: '#6a5543' }}>
              Pagina wordt geladen…
            </p>
          </section>
        </main>
      }
    >
      <WachtwoordResettenInner />
    </Suspense>
  );
}
