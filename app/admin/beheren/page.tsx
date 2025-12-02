// app/admin/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Kaas = {
  id: string;
  naam: string;
  omschrijving: string | null;
  categorie: string;
  prijsCent: number;
  afbeelding: string | null;
  actief: boolean;
};

export default function AdminKaasBeheerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userAny = session?.user as any;
  const isAdmin = !!userAny?.isAdmin;

  const [kazen, setKazen] = useState<Kaas[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voor nieuwe kaas
  const [newNaam, setNewNaam] = useState('');
  const [newOmschrijving, setNewOmschrijving] = useState('');
  const [newCategorie, setNewCategorie] = useState('');
  const [newPrijs, setNewPrijs] = useState('');
  const [newAfbeelding, setNewAfbeelding] = useState('');

  // Voor bewerken
  const [editId, setEditId] = useState<string | null>(null);
  const [editNaam, setEditNaam] = useState('');
  const [editOmschrijving, setEditOmschrijving] = useState('');
  const [editCategorie, setEditCategorie] = useState('');
  const [editPrijs, setEditPrijs] = useState('');
  const [editAfbeelding, setEditAfbeelding] = useState('');
  const [editActief, setEditActief] = useState(true);

  // Kazen ophalen
  async function loadKazen() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/kaas');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Kon kazen niet laden.');
        setLoading(false);
        return;
      }
      const data = (await res.json()) as Kaas[];
      setKazen(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Kon kazen niet laden.');
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && isAdmin) {
      loadKazen();
    }
  }, [status, isAdmin]);

  // Niet ingelogd of geen admin → netjes terug
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !isAdmin) {
      router.push('/');
    }
  }, [status, session, isAdmin, router]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newNaam || !newCategorie || !newPrijs) return;

    const prijsEuro = parseFloat(newPrijs.replace(',', '.'));
    if (isNaN(prijsEuro)) {
      setError('Voer een geldige prijs in.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/kaas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam: newNaam,
          omschrijving: newOmschrijving || undefined,
          categorie: newCategorie,
          prijsEuro,
          afbeelding: newAfbeelding || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Kaas toevoegen mislukt.');
        setSaving(false);
        return;
      }

      // Form leegmaken en herladen
      setNewNaam('');
      setNewOmschrijving('');
      setNewCategorie('');
      setNewPrijs('');
      setNewAfbeelding('');
      setSaving(false);
      loadKazen();
    } catch (e) {
      console.error(e);
      setError('Kaas toevoegen mislukt.');
      setSaving(false);
    }
  }

  function startEdit(k: Kaas) {
    setEditId(k.id);
    setEditNaam(k.naam);
    setEditOmschrijving(k.omschrijving ?? '');
    setEditCategorie(k.categorie);
    setEditPrijs((k.prijsCent / 100).toFixed(2));
    setEditAfbeelding(k.afbeelding ?? '');
    setEditActief(k.actief);
  }

  function cancelEdit() {
    setEditId(null);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editId || !editNaam || !editCategorie || !editPrijs) return;

    const prijsEuro = parseFloat(editPrijs.replace(',', '.'));
    if (isNaN(prijsEuro)) {
      setError('Voer een geldige prijs in.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/kaas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editId,
          naam: editNaam,
          omschrijving: editOmschrijving || undefined,
          categorie: editCategorie,
          prijsEuro,
          afbeelding: editAfbeelding || undefined,
          actief: editActief,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Kaas bijwerken mislukt.');
        setSaving(false);
        return;
      }

      setSaving(false);
      setEditId(null);
      loadKazen();
    } catch (e) {
      console.error(e);
      setError('Kaas bijwerken mislukt.');
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je deze kaas wilt verwijderen?')) return;

    try {
      setSaving(true);
      setError(null);
      const res = await fetch('/api/admin/kaas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Kaas verwijderen mislukt.');
        setSaving(false);
        return;
      }

      setSaving(false);
      setKazen((prev) => prev.filter((k) => k.id !== id));
    } catch (e) {
      console.error(e);
      setError('Kaas verwijderen mislukt.');
      setSaving(false);
    }
  }

  if (!session || !isAdmin) {
    return null; // redirect gebeurt in useEffect
  }

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#521f0a' }}>
        Kazen beheren
      </h1>

      {/* Fout / info */}
      {error && (
        <div
          style={{
            border: '1px solid rgba(176,0,32,0.25)',
            background: 'rgba(176,0,32,0.06)',
            color: '#b00020',
            borderRadius: 10,
            padding: '0.6rem 0.8rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Kaas toevoegen */}
      <section
        style={{
          borderRadius: 14,
          border: '1px solid #e6e1d8',
          padding: '1rem',
          marginBottom: '1.5rem',
          background: '#fff',
        }}
      >
        <h2 style={{ margin: 0, marginBottom: '0.75rem', color: '#521f0a', fontSize: '1.1rem' }}>
          Nieuwe kaas toevoegen
        </h2>
        <form
          onSubmit={handleAdd}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '0.75rem',
          }}
        >
          <div>
            <label>Naam *</label>
            <input
              type="text"
              value={newNaam}
              onChange={(e) => setNewNaam(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label>Categorie *</label>
            <input
              type="text"
              value={newCategorie}
              onChange={(e) => setNewCategorie(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label>Prijs (€) *</label>
            <input
              type="text"
              value={newPrijs}
              onChange={(e) => setNewPrijs(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label>Afbeelding (URL, optioneel)</label>
            <input
              type="text"
              value={newAfbeelding}
              onChange={(e) => setNewAfbeelding(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Omschrijving (optioneel)</label>
            <textarea
              value={newOmschrijving}
              onChange={(e) => setNewOmschrijving(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 8,
                border: '1px solid #ddd',
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 999,
                border: 'none',
                background: '#c28b00',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {saving ? 'Opslaan…' : 'Kaas toevoegen'}
            </button>
          </div>
        </form>
      </section>

      {/* Lijst met kazen */}
      <section
        style={{
          borderRadius: 14,
          border: '1px solid #e6e1d8',
          padding: '1rem',
          background: '#fff',
        }}
      >
        <h2 style={{ margin: 0, marginBottom: '0.75rem', color: '#521f0a', fontSize: '1.1rem' }}>
          Alle kazen
        </h2>

        {loading ? (
          <p>Kazen laden…</p>
        ) : kazen.length === 0 ? (
          <p>Er zijn nog geen kazen in de database.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.95rem',
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eee' }}>Naam</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #eee' }}>Categorie</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #eee' }}>Prijs</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '1px solid #eee' }}>Actief</th>
                  <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '1px solid #eee' }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {kazen.map((k) => {
                  const isEditing = editId === k.id;
                  const prijsEuro = (k.prijsCent / 100).toFixed(2);

                  if (isEditing) {
                    return (
                      <tr key={k.id}>
                        <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea' }}>
                          <input
                            type="text"
                            value={editNaam}
                            onChange={(e) => setEditNaam(e.target.value)}
                            style={{ width: '100%', padding: '0.3rem', borderRadius: 6, border: '1px solid #ddd' }}
                          />
                        </td>
                        <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea' }}>
                          <input
                            type="text"
                            value={editCategorie}
                            onChange={(e) => setEditCategorie(e.target.value)}
                            style={{ width: '100%', padding: '0.3rem', borderRadius: 6, border: '1px solid #ddd' }}
                          />
                        </td>
                        <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea', textAlign: 'right' }}>
                          <input
                            type="text"
                            value={editPrijs}
                            onChange={(e) => setEditPrijs(e.target.value)}
                            style={{ width: '80px', padding: '0.3rem', borderRadius: 6, border: '1px solid #ddd', textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={editActief}
                            onChange={(e) => setEditActief(e.target.checked)}
                          />
                        </td>
                        <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea', textAlign: 'right' }}>
                          <button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            style={{
                              marginRight: '0.4rem',
                              padding: '0.35rem 0.7rem',
                              borderRadius: 999,
                              border: 'none',
                              background: '#c28b00',
                              color: '#fff',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            Opslaan
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            style={{
                              padding: '0.35rem 0.7rem',
                              borderRadius: 999,
                              border: '1px solid #ccc',
                              background: '#fff',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            Annuleren
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={k.id}>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea' }}>{k.naam}</td>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea' }}>{k.categorie}</td>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea', textAlign: 'right' }}>
                        € {prijsEuro}
                      </td>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea', textAlign: 'center' }}>
                        {k.actief ? 'Ja' : 'Nee'}
                      </td>
                      <td style={{ padding: '0.4rem', borderBottom: '1px solid #f3f0ea', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => startEdit(k)}
                          style={{
                            marginRight: '0.4rem',
                            padding: '0.35rem 0.7rem',
                            borderRadius: 999,
                            border: '1px solid #ccc',
                            background: '#fff',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          Bewerken
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(k.id)}
                          style={{
                            padding: '0.35rem 0.7rem',
                            borderRadius: 999,
                            border: 'none',
                            background: '#b00020',
                            color: '#fff',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                          }}
                        >
                          Verwijderen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
