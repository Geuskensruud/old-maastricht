// app/account/AccountClient.tsx
'use client';

import { FormEvent, useState, ChangeEvent } from 'react';
import type { CSSProperties } from 'react';

type AccountUser = {
  email: string;
  voornaam: string;
  achternaam: string;
  bedrijfsnaam: string;
  telefoon: string;
  straat: string;
  postcode: string;
  plaats: string;
  land: string;
};

type Props = {
  initialUser: AccountUser;
};

export default function AccountClient({ initialUser }: Props) {
  // Wat er nu “geldig” is (laatste opgeslagen versie)
  const [displayUser, setDisplayUser] = useState<AccountUser>(initialUser);
  // Draft voor bewerken
  const [editDraft, setEditDraft] = useState<AccountUser>(initialUser);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDraftChange =
    (field: keyof AccountUser) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setEditDraft((prev) => ({ ...prev, [field]: value }));
    };

  function startEdit() {
    // Begin met de huidige weergave-waarden
    setEditDraft(displayUser);
    setError(null);
    setSuccess(null);
    setEditing(true);
  }

  function cancelEdit() {
    // Draft terugzetten naar laatste display-versie en uit bewerkmodus
    setEditDraft(displayUser);
    setEditing(false);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!editing) {
      // Veiligheidscheck: alleen saven in bewerkmodus
      return;
    }

    const u = editDraft;

    if (
      !u.voornaam ||
      !u.achternaam ||
      !u.telefoon ||
      !u.straat ||
      !u.postcode ||
      !u.plaats ||
      !u.land
    ) {
      setError('Vul alle verplichte velden in.');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voornaam: u.voornaam,
          achternaam: u.achternaam,
          bedrijfsnaam: u.bedrijfsnaam || null,
          telefoon: u.telefoon,
          straat: u.straat,
          postcode: u.postcode,
          plaats: u.plaats,
          land: u.land,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Kon accountgegevens niet opslaan.');
        setSaving(false);
        return;
      }

      // Sla succesvol op → displayUser wordt de nieuwe versie
      setDisplayUser(u);
      setSuccess('Je accountgegevens zijn bijgewerkt.');
      setSaving(false);
      setEditing(false);
    } catch (err) {
      console.error('[AccountClient] save error:', err);
      setError('Kon accountgegevens niet opslaan.');
      setSaving(false);
    }
  }

  // Bekijken-modus
  if (!editing) {
    const u = displayUser;
    return (
      <section
        style={{
          borderRadius: 16,
          border: '1px solid #e6e1d8',
          background: '#fffef8',
          padding: '1.25rem 1.4rem',
          display: 'grid',
          gap: '1rem',
        }}
      >
        {/* Persoonlijke gegevens */}
        <div>
          <h2
            style={{
              fontSize: '1.05rem',
              marginBottom: '0.5rem',
              color: '#521f0a',
            }}
          >
            Persoonlijke gegevens
          </h2>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              rowGap: '0.35rem',
              columnGap: '1rem',
              fontSize: '0.95rem',
            }}
          >
            <dt style={{ fontWeight: 600 }}>Naam</dt>
            <dd>{`${u.voornaam} ${u.achternaam}`.trim() || '—'}</dd>

            <dt style={{ fontWeight: 600 }}>E-mailadres</dt>
            <dd>{u.email}</dd>

            <dt style={{ fontWeight: 600 }}>Telefoon</dt>
            <dd>{u.telefoon || '—'}</dd>

            <dt style={{ fontWeight: 600 }}>Bedrijfsnaam</dt>
            <dd>{u.bedrijfsnaam || '—'}</dd>
          </dl>
        </div>

        {/* Adres */}
        <div style={{ marginTop: '1rem' }}>
          <h2
            style={{
              fontSize: '1.05rem',
              marginBottom: '0.5rem',
              color: '#521f0a',
            }}
          >
            Adres
          </h2>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              rowGap: '0.35rem',
              columnGap: '1rem',
              fontSize: '0.95rem',
            }}
          >
            <dt style={{ fontWeight: 600 }}>Straat</dt>
            <dd>{u.straat}</dd>

            <dt style={{ fontWeight: 600 }}>Postcode</dt>
            <dd>{u.postcode}</dd>

            <dt style={{ fontWeight: 600 }}>Plaats</dt>
            <dd>{u.plaats}</dd>

            <dt style={{ fontWeight: 600 }}>Land</dt>
            <dd>{u.land}</dd>
          </dl>
        </div>

        {/* Knop bewerken */}
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={startEdit}
            style={primaryButtonStyle}
          >
            Gegevens bewerken
          </button>
        </div>
      </section>
    );
  }

  // Bewerken-modus
  const u = editDraft;
  return (
    <section
      style={{
        borderRadius: 16,
        border: '1px solid #e6e1d8',
        background: '#fffef8',
        padding: '1.25rem 1.4rem',
        display: 'grid',
        gap: '1rem',
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Persoonlijke gegevens */}
        <div>
          <h2
            style={{
              fontSize: '1.05rem',
              marginBottom: '0.5rem',
              color: '#521f0a',
            }}
          >
            Persoonlijke gegevens
          </h2>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              rowGap: '0.35rem',
              columnGap: '1rem',
              fontSize: '0.95rem',
            }}
          >
            <dt style={{ fontWeight: 600 }}>Naam</dt>
            <dd>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                }}
              >
                <input
                  type="text"
                  placeholder="Voornaam"
                  value={u.voornaam}
                  onChange={handleDraftChange('voornaam')}
                  required
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Achternaam"
                  value={u.achternaam}
                  onChange={handleDraftChange('achternaam')}
                  required
                  style={inputStyle}
                />
              </div>
            </dd>

            <dt style={{ fontWeight: 600 }}>E-mailadres</dt>
            <dd>{u.email}</dd>

            <dt style={{ fontWeight: 600 }}>Telefoon</dt>
            <dd>
              <input
                type="tel"
                value={u.telefoon}
                onChange={handleDraftChange('telefoon')}
                required
                style={inputStyle}
              />
            </dd>

            <dt style={{ fontWeight: 600 }}>Bedrijfsnaam</dt>
            <dd>
              <input
                type="text"
                value={u.bedrijfsnaam}
                onChange={handleDraftChange('bedrijfsnaam')}
                style={inputStyle}
              />
            </dd>
          </dl>
        </div>

        {/* Adres */}
        <div style={{ marginTop: '1rem' }}>
          <h2
            style={{
              fontSize: '1.05rem',
              marginBottom: '0.5rem',
              color: '#521f0a',
            }}
          >
            Adres
          </h2>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              rowGap: '0.35rem',
              columnGap: '1rem',
              fontSize: '0.95rem',
            }}
          >
            <dt style={{ fontWeight: 600 }}>Straat</dt>
            <dd>
              <input
                type="text"
                value={u.straat}
                onChange={handleDraftChange('straat')}
                required
                style={inputStyle}
              />
            </dd>

            <dt style={{ fontWeight: 600 }}>Postcode</dt>
            <dd>
              <input
                type="text"
                value={u.postcode}
                onChange={handleDraftChange('postcode')}
                required
                style={inputStyle}
              />
            </dd>

            <dt style={{ fontWeight: 600 }}>Plaats</dt>
            <dd>
              <input
                type="text"
                value={u.plaats}
                onChange={handleDraftChange('plaats')}
                required
                style={inputStyle}
              />
            </dd>

            <dt style={{ fontWeight: 600 }}>Land</dt>
            <dd>
              <input
                type="text"
                value={u.land}
                onChange={handleDraftChange('land')}
                required
                style={inputStyle}
              />
            </dd>
          </dl>
        </div>

        {/* Meldingen */}
        {error && (
          <p
            style={{
              marginTop: '0.75rem',
              fontSize: '0.9rem',
              color: '#b00020',
            }}
          >
            {error}
          </p>
        )}
        {success && (
          <p
            style={{
              marginTop: '0.75rem',
              fontSize: '0.9rem',
              color: '#168f5c',
            }}
          >
            {success}
          </p>
        )}

        {/* Buttons */}
        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <button
            type="submit"
            disabled={saving}
            style={primaryButtonStyle}
          >
            {saving ? 'Opslaan…' : 'Opslaan'}
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            style={secondaryButtonStyle}
          >
            Annuleren
          </button>
        </div>
      </form>
    </section>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.4rem 0.6rem',
  borderRadius: 8,
  border: '1px solid #ddd3c5',
  fontSize: '0.9rem',
};

const primaryButtonStyle: CSSProperties = {
  padding: '0.5rem 1.2rem',
  borderRadius: 999,
  border: 'none',
  background: '#c28b00',
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
};

const secondaryButtonStyle: CSSProperties = {
  padding: '0.5rem 1.2rem',
  borderRadius: 999,
  border: '1px solid #c28b00',
  background: 'transparent',
  color: '#521f0a',
  fontWeight: 500,
  fontSize: '0.9rem',
  cursor: 'pointer',
};
