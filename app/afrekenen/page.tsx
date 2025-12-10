// app/afrekenen/page.tsx
'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useCart } from '@/components/CartContext';
import Link from 'next/link';

type LandOptie = 'Nederland' | 'België' | 'Duitsland';

export default function AfrekenenPage() {
  const { items, total } = useCart();

  const [voornaam, setVoornaam] = useState('');
  const [achternaam, setAchternaam] = useState('');
  const [bedrijfsnaam, setBedrijfsnaam] = useState('');
  const [email, setEmail] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [landRegio, setLandRegio] = useState<LandOptie>('Nederland');
  const [straatHuisnummer, setStraatHuisnummer] = useState('');
  const [postcode, setPostcode] = useState('');
  const [plaats, setPlaats] = useState('');
  const [anderVerzendadres, setAnderVerzendadres] = useState(false);
  const [vStraatHuisnummer, setVStraatHuisnummer] = useState('');
  const [vPostcode, setVPostcode] = useState('');
  const [vPlaats, setVPlaats] = useState('');
  const [vLandRegio, setVLandRegio] = useState<LandOptie>('Nederland');
  const [bestelnotities, setBestelnotities] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasItems = items.length > 0;

  // 🔸 Auto-prefill alléén factuurgegevens vanuit /api/account/profiel
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const res = await fetch('/api/account/profiel');
        if (!res.ok) {
          // 401 / 404 / 500 → gewoon negeren (niet ingelogd of geen profiel)
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        setVoornaam((prev) => prev || data.voornaam || '');
        setAchternaam((prev) => prev || data.achternaam || '');
        setBedrijfsnaam((prev) => prev || data.bedrijfsnaam || '');
        setEmail((prev) => prev || data.email || '');
        setTelefoon((prev) => prev || data.telefoon || '');

        if (data.landRegio === 'België' || data.landRegio === 'Duitsland') {
          setLandRegio(data.landRegio as LandOptie);
        }

        setStraatHuisnummer((prev) => prev || data.straatHuisnummer || '');
        setPostcode((prev) => prev || data.postcode || '');
        setPlaats((prev) => prev || data.plaats || '');

        // Belangrijk: géén automatisch ander verzendadres meer.
        // De gebruiker moet zelf het vinkje zetten en verzendvelden invullen.
        // Dus:
        // - anderVerzendadres laten zoals default (false)
        // - vStraatHuisnummer / vPostcode / vPlaats NIET prefillen
      } catch (e) {
        console.error('[afrekenen] kon profiel niet laden', e);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasItems) {
      setError('Je winkelmand is leeg.');
      return;
    }

    // Verplichte velden (bedrijfsnaam niet verplicht)
    if (
      !voornaam ||
      !achternaam ||
      !email ||
      !telefoon ||
      !straatHuisnummer ||
      !postcode ||
      !plaats
    ) {
      setError('Vul alle verplichte velden in.');
      return;
    }

    if (anderVerzendadres) {
      if (!vStraatHuisnummer || !vPostcode || !vPlaats) {
        setError('Vul alle verplichte velden voor het verzendadres in.');
        return;
      }
    }

    try {
      setLoading(true);

      const factuurAdres = {
        straatHuisnummer,
        postcode,
        plaats,
        landRegio,
      };

      const verzendAdres = anderVerzendadres
        ? {
            straatHuisnummer: vStraatHuisnummer,
            postcode: vPostcode,
            plaats: vPlaats,
            landRegio: vLandRegio,
          }
        : factuurAdres;

      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({
            id: it.id,
            name: it.name,
            price: it.price,
            qty: it.qty,
          })),
          customer: {
            voornaam,
            achternaam,
            bedrijfsnaam: bedrijfsnaam || undefined,
            email,
            telefoon,
            factuurAdres,
            verzendAdres,
            bestelnotities: bestelnotities || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || 'Kon geen iDEAL-betaling starten.');
        setLoading(false);
        return;
      }

      window.location.href = data.url as string;
    } catch (err) {
      console.error('[afrekenen] error:', err);
      setError('Kon geen iDEAL-betaling starten.');
      setLoading(false);
    }
  }

  if (!hasItems) {
    return (
      <main style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <h1
          style={{
            fontSize: '1.6rem',
            marginBottom: '0.75rem',
            color: '#521f0a',
          }}
        >
          Afrekenen
        </h1>
        <p style={{ marginBottom: '1rem' }}>
          Je winkelmand is leeg. Voeg eerst producten toe voordat je kunt afrekenen.
        </p>
        <Link
          href="/shop"
          style={{
            display: 'inline-block',
            padding: '0.55rem 1.2rem',
            borderRadius: 999,
            border: 'none',
            background: '#c28b00',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Ga naar de shop
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1
        style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          color: '#521f0a',
        }}
      >
        Afrekenen
      </h1>

      <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#5c4940' }}>
        Vul je gegevens in. Daarna word je doorgestuurd naar iDEAL om je betaling
        veilig af te ronden.
      </p>

      <section
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: '1.3fr 1fr',
        }}
      >
        {/* Formulier links */}
        <form onSubmit={handleSubmit}>
          <h2
            style={{
              fontSize: '1.1rem',
              marginBottom: '0.75rem',
              color: '#521f0a',
            }}
          >
            Factuurgegevens
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem 1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '0.9rem',
                }}
              >
                Voornaam *
              </label>
              <input
                type="text"
                value={voornaam}
                onChange={(e) => setVoornaam(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 8,
                  border: '1px solid #ddd3c5',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '0.9rem',
                }}
              >
                Achternaam *
              </label>
              <input
                type="text"
                value={achternaam}
                onChange={(e) => setAchternaam(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 8,
                  border: '1px solid #ddd3c5',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.9rem',
              }}
            >
              Bedrijfsnaam (optioneel)
            </label>
            <input
              type="text"
              value={bedrijfsnaam}
              onChange={(e) => setBedrijfsnaam(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: 8,
                border: '1px solid #ddd3c5',
              }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.9rem',
              }}
            >
              E-mailadres *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: 8,
                border: '1px solid #ddd3c5',
              }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.9rem',
              }}
            >
              Telefoon *
            </label>
            <input
              type="tel"
              value={telefoon}
              onChange={(e) => setTelefoon(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: 8,
                border: '1px solid #ddd3c5',
              }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.9rem',
              }}
            >
              Land / regio *
            </label>
            <select
              value={landRegio}
              onChange={(e) => setLandRegio(e.target.value as LandOptie)}
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: 8,
                border: '1px solid #ddd3c5',
                background: '#fff',
              }}
            >
              <option value="Nederland">Nederland</option>
              <option value="België">België</option>
              <option value="Duitsland">Duitsland</option>
            </select>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.9rem',
              }}
            >
              Straatnaam & huisnummer *
            </label>
            <input
              type="text"
              value={straatHuisnummer}
              onChange={(e) => setStraatHuisnummer(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: 8,
                border: '1px solid #ddd3c5',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem 1rem',
              marginBottom: '0.75rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '0.9rem',
                }}
              >
                Postcode *
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 8,
                  border: '1px solid #ddd3c5',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.25rem',
                  fontSize: '0.9rem',
                }}
              >
                Plaats *
              </label>
              <input
                type="text"
                value={plaats}
                onChange={(e) => setPlaats(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 8,
                  border: '1px solid #ddd3c5',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem',
              }}
            >
              <input
                type="checkbox"
                checked={anderVerzendadres}
                onChange={(e) => setAnderVerzendadres(e.target.checked)}
              />
              Ander verzendadres gebruiken
            </label>
          </div>

          {anderVerzendadres && (
            <div
              style={{
                padding: '0.75rem 0.9rem',
                borderRadius: 10,
                border: '1px solid #e0d4c2',
                marginBottom: '0.75rem',
              }}
            >
              <h3
                style={{
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  color: '#521f0a',
                }}
              >
                Verzendadres
              </h3>

              <div style={{ marginBottom: '0.75rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontSize: '0.9rem',
                  }}
                >
                  Straatnaam & huisnummer *
                </label>
                <input
                  type="text"
                  value={vStraatHuisnummer}
                  onChange={(e) => setVStraatHuisnummer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 8,
                    border: '1px solid #ddd3c5',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem 1rem',
                  marginBottom: '0.75rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.25rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={vPostcode}
                    onChange={(e) => setVPostcode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 8,
                      border: '1px solid #ddd3c5',
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.25rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    Plaats *
                  </label>
                  <input
                    type="text"
                    value={vPlaats}
                    onChange={(e) => setVPlaats(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 8,
                      border: '1px solid #ddd3c5',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.25rem',
                    fontSize: '0.9rem',
                  }}
                >
                  Land / regio
                </label>
                <select
                  value={vLandRegio}
                  onChange={(e) => setVLandRegio(e.target.value as LandOptie)}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 8,
                    border: '1px solid #ddd3c5',
                    background: '#fff',
                  }}
                >
                  <option value="Nederland">Nederland</option>
                  <option value="België">België</option>
                  <option value="Duitsland">Duitsland</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '0.75rem' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.25rem',
                fontSize: '0.9rem',
              }}
            >
              Bestelnotities (optioneel)
            </label>
            <textarea
              value={bestelnotities}
              onChange={(e) => setBestelnotities(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.45rem 0.6rem',
                borderRadius: 8,
                border: '1px solid #ddd3c5',
                resize: 'vertical',
              }}
            />
          </div>

          {error && (
            <p
              style={{
                marginTop: '0.25rem',
                marginBottom: '0.5rem',
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
              marginTop: '0.5rem',
              padding: '0.6rem 1.4rem',
              borderRadius: 999,
              border: 'none',
              background: '#168f5c',
              color: '#fff',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {loading ? 'Verbinding met iDEAL…' : 'Bestelling plaatsen & betalen met iDEAL'}
          </button>
        </form>

        {/* Overzicht rechts */}
        <aside
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 14,
            border: '1px solid #e6e1d8',
            background: '#fffef8',
            alignSelf: 'flex-start',
          }}
        >
          <h2
            style={{
              fontSize: '1.05rem',
              marginBottom: '0.75rem',
              color: '#521f0a',
            }}
          >
            Jouw bestelling
          </h2>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              marginBottom: '0.75rem',
            }}
          >
            {items.map((it) => (
              <li
                key={it.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.3rem 0',
                  borderBottom: '1px solid #f0e6d8',
                  fontSize: '0.92rem',
                }}
              >
                <span>
                  {it.name} × {it.qty}
                </span>
                <span>
                  € {(it.price * it.qty).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              marginTop: '0.5rem',
            }}
          >
            <span>Totaal</span>
            <span>€ {total.toFixed(2)}</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
