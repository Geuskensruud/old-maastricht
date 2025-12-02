'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import './Register.css';

type Land = 'NEDERLAND' | 'BELGIE' | 'DUITSLAND' | '';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [wachtwoord, setWachtwoord] = useState('');
  const [wachtwoord2, setWachtwoord2] = useState('');

  const [voornaam, setVoornaam] = useState('');
  const [achternaam, setAchternaam] = useState('');
  const [bedrijfsnaam, setBedrijfsnaam] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [straat, setStraat] = useState('');
  const [postcode, setPostcode] = useState('');
  const [plaats, setPlaats] = useState('');
  const [land, setLand] = useState<Land>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Alleen checken op "iets ingevuld" + wachtwoorden gelijk
  const alleVerplichteVeldenGevuld =
    email.trim() !== '' &&
    wachtwoord.trim() !== '' &&
    wachtwoord2.trim() !== '' &&
    voornaam.trim() !== '' &&
    achternaam.trim() !== '' &&
    telefoon.trim() !== '' &&
    straat.trim() !== '' &&
    postcode.trim() !== '' &&
    plaats.trim() !== '' &&
    land !== '' &&
    wachtwoord === wachtwoord2;

  const formGeldig = alleVerplichteVeldenGevuld;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formGeldig) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          wachtwoord,
          voornaam,
          achternaam,
          bedrijfsnaam,
          telefoon,
          straat,
          postcode,
          plaats,
          land: land || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Registreren is mislukt.');
        setLoading(false);
        return;
      }

      setSuccess('Account succesvol aangemaakt! Je wordt doorgestuurd naar de login pagina…');
      setLoading(false);

      setTimeout(() => {
        router.push('/login?registered=1');
      }, 1200);
    } catch (err) {
      console.error(err);
      setError('Er is iets misgegaan. Probeer het later nog eens.');
      setLoading(false);
    }
  }

  return (
    <main className="register-wrap">
      <section className="register-card" aria-labelledby="registerTitle">
        <h1 id="registerTitle" className="register-title">Account aanmaken</h1>
        <p className="register-sub">
          Vul je gegevens in om een account aan te maken.
        </p>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* Inloggegevens */}
          <div className="form-section">
            <h2 className="section-title">Inloggegevens</h2>

            <div className="form-row">
              <label htmlFor="email">E-mail *</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="wachtwoord">Wachtwoord *</label>
              <input
                id="wachtwoord"
                type="password"
                autoComplete="new-password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="wachtwoord2">Herhaal wachtwoord *</label>
              <input
                id="wachtwoord2"
                type="password"
                autoComplete="new-password"
                value={wachtwoord2}
                onChange={(e) => setWachtwoord2(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Gegevens */}
          <div className="form-section">
            <h2 className="section-title">Gegevens</h2>

            <div className="form-row form-row--2col">
              <div>
                <label htmlFor="voornaam">Voornaam *</label>
                <input
                  id="voornaam"
                  type="text"
                  value={voornaam}
                  onChange={(e) => setVoornaam(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="achternaam">Achternaam *</label>
                <input
                  id="achternaam"
                  type="text"
                  value={achternaam}
                  onChange={(e) => setAchternaam(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="bedrijfsnaam">Bedrijfsnaam (optioneel)</label>
              <input
                id="bedrijfsnaam"
                type="text"
                value={bedrijfsnaam}
                onChange={(e) => setBedrijfsnaam(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label htmlFor="telefoon">Telefoon *</label>
              <input
                id="telefoon"
                type="tel"
                value={telefoon}
                onChange={(e) => setTelefoon(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="straat">Straat & huisnummer *</label>
              <input
                id="straat"
                type="text"
                value={straat}
                onChange={(e) => setStraat(e.target.value)}
                required
              />
            </div>

            <div className="form-row form-row--3col">
              <div>
                <label htmlFor="postcode">Postcode *</label>
                <input
                  id="postcode"
                  type="text"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="plaats">Plaats *</label>
                <input
                  id="plaats"
                  type="text"
                  value={plaats}
                  onChange={(e) => setPlaats(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="land">Land / regio *</label>
                <select
                  id="land"
                  value={land}
                  onChange={(e) => setLand(e.target.value as Land)}
                  required
                >
                  <option value="">Selecteer...</option>
                  <option value="NEDERLAND">Nederland</option>
                  <option value="BELGIE">België</option>
                  <option value="DUITSLAND">Duitsland</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert-success" role="status">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={!formGeldig || loading}
          >
            {loading ? 'Bezig met registreren…' : 'Account aanmaken'}
          </button>

          <p className="register-foot">
            Heb je al een account? <a href="/login">Log hier in</a>.
          </p>
        </form>
      </section>
    </main>
  );
}
