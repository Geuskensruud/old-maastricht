'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import './Login.css';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validPw = wachtwoord.length >= 6;
  const formValid = validEmail && validPw;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formValid) return;
    setLoading(true);
    setErr(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password: wachtwoord,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      setErr(res.error || 'Inloggen mislukt');
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <main className="login-wrap">
      <section className="login-card" aria-labelledby="loginTitle">
        <h1 id="loginTitle" className="login-title">Login</h1>
        <p className="login-sub">Log in om je bestellingen en gegevens te beheren.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={email.length > 0 && !validEmail}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="wachtwoord">Wachtwoord</label>
            <div className="pw-input">
              <input
                id="wachtwoord"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                aria-invalid={wachtwoord.length > 0 && !validPw}
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((s) => !s)}
              >
                {showPw ? 'Verberg' : 'Toon'}
              </button>
            </div>
          </div>

          {err && (
            <div className="alert-error" role="alert">
              {err}
            </div>
          )}

          <button
            className="btn-submit"
            type="submit"
            disabled={!formValid || loading}
          >
            {loading ? 'Bezig…' : 'Inloggen'}
          </button>
        </form>

        <p className="login-foot">
          Nog geen account?{' '}
          <a href="/register" className="link-accent">
            Maak er één aan
          </a>.
        </p>
      </section>
    </main>
  );
}
