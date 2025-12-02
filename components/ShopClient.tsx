'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/components/products';

type Props = {
  initialProducts: Product[];
};

type KaasApi = {
  id: string;
  naam: string;
  omschrijving: string | null;
  categorie: string;
  prijsCent: number;
  afbeelding: string | null;
  actief: boolean;
};

function mapCategory(raw: string): Product['category'] {
  switch (raw) {
    case 'Harde kazen':
      return 'Harde kazen';
    case 'Zachte kazen':
      return 'Zachte kazen';
    case 'Geiten/Schapen':
      return 'Geiten/Schapen';
    case 'Specials':
      return 'Specials';
    default:
      return 'Specials';
  }
}

export default function ShopClient({ initialProducts }: Props) {
  const { data: session } = useSession();
  const userAny = session?.user as any;
  const isAdmin = !!userAny?.isAdmin;

  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newNaam, setNewNaam] = useState('');
  const [newOmschrijving, setNewOmschrijving] = useState('');
  const [newCategorie, setNewCategorie] = useState<
    'Harde kazen' | 'Zachte kazen' | 'Geiten/Schapen' | 'Specials' | ''
  >('');
  const [newPrijs, setNewPrijs] = useState('');
  const [newAfbeelding, setNewAfbeelding] = useState('');

  const [editId, setEditId] = useState<string | null>(null);
  const [editNaam, setEditNaam] = useState('');
  const [editOmschrijving, setEditOmschrijving] = useState('');
  const [editCategorie, setEditCategorie] = useState<
    'Harde kazen' | 'Zachte kazen' | 'Geiten/Schapen' | 'Specials' | ''
  >('');
  const [editPrijs, setEditPrijs] = useState('');
  const [editAfbeelding, setEditAfbeelding] = useState('');
  const [editActief, setEditActief] = useState(true);

  async function reloadFromApi() {
    try {
      setLoadingAdmin(true);
      setError(null);
      const res = await fetch('/api/admin/kaas');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Kon kazen niet laden (admin).');
        setLoadingAdmin(false);
        return;
      }
      const data = (await res.json()) as KaasApi[];
      const mapped: Product[] = data.map((k) => ({
        id: k.id,
        name: k.naam,
        description: k.omschrijving ?? '',
        category: mapCategory(k.categorie),
        price: k.prijsCent / 100,
        image: k.afbeelding ?? '/icons/cheese.png',
      }));
      setProducts(mapped);
      setLoadingAdmin(false);
    } catch (e) {
      console.error(e);
      setError('Kon kazen niet laden (admin).');
      setLoadingAdmin(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      reloadFromApi();
    }
  }, [isAdmin]);

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

      setNewNaam('');
      setNewOmschrijving('');
      setNewCategorie('');
      setNewPrijs('');
      setNewAfbeelding('');
      setSaving(false);
      reloadFromApi();
    } catch (e) {
      console.error(e);
      setError('Kaas toevoegen mislukt.');
      setSaving(false);
    }
  }

  function startEdit(id: string) {
    const k = products.find((p) => p.id === id);
    if (!k) return;
    setEditId(k.id);
    setEditNaam(k.name);
    setEditOmschrijving(k.description ?? '');
    setEditCategorie(k.category);
    setEditPrijs(k.price.toFixed(2));
    setEditAfbeelding(k.image ?? '');
    setEditActief(true);
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
      reloadFromApi();
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
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
      setError('Kaas verwijderen mislukt.');
      setSaving(false);
    }
  }

  return (
    <div className="shop-page">
      <header className="shop-header">
        <h1 className="shop-title">Onze kazen</h1>
        <p className="shop-subtitle">
          Ontdek het assortiment Old Maastricht kazen – direct uit onze rijpingskamers.
        </p>
      </header>

      {/* Shop-grid voor iedereen */}
      <section className="shop-grid-section">
        {products.length === 0 ? (
          <p className="shop-empty">
            Er zijn momenteel nog geen kazen beschikbaar.
          </p>
        ) : (
          <div className="shop-grid">
            {products.map((product) => (
              <div key={product.id} className="shop-item-with-admin">
                <ProductCard product={product} />

                {isAdmin && (
                  <div className="shop-item-admin-actions">
                    <button
                      type="button"
                      className="shop-admin-btn"
                      onClick={() => startEdit(product.id)}
                    >
                      Bewerken
                    </button>
                    <button
                      type="button"
                      className="shop-admin-btn shop-admin-btn--danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      Verwijderen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Admin-paneel onder de shop */}
      {isAdmin && (
        <section className="shop-admin-panel">
          <h2 className="shop-admin-title">Kazen beheren</h2>

          {error && (
            <div className="shop-admin-error" role="alert">
              {error}
            </div>
          )}

          {loadingAdmin && <p>Kazen laden…</p>}

          {/* Bewerken */}
          {editId && (
            <form className="shop-admin-form" onSubmit={handleSaveEdit}>
              <h3>Bewerk kaas</h3>
              <div className="shop-admin-form-grid">
                <div>
                  <label>Naam *</label>
                  <input
                    type="text"
                    value={editNaam}
                    onChange={(e) => setEditNaam(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Categorie *</label>
                  <select
                    value={editCategorie}
                    onChange={(e) =>
                      setEditCategorie(
                        e.target.value as
                          | 'Harde kazen'
                          | 'Zachte kazen'
                          | 'Geiten/Schapen'
                          | 'Specials'
                          | ''
                      )
                    }
                    required
                  >
                    <option value="">Selecteer…</option>
                    <option value="Harde kazen">Harde kazen</option>
                    <option value="Zachte kazen">Zachte kazen</option>
                    <option value="Geiten/Schapen">Geiten/Schapen</option>
                    <option value="Specials">Specials</option>
                  </select>
                </div>
                <div>
                  <label>Prijs (€) *</label>
                  <input
                    type="text"
                    value={editPrijs}
                    onChange={(e) => setEditPrijs(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Afbeelding (URL, optioneel)</label>
                  <input
                    type="text"
                    value={editAfbeelding}
                    onChange={(e) => setEditAfbeelding(e.target.value)}
                  />
                </div>
                <div className="shop-admin-form-full">
                  <label>Omschrijving (optioneel)</label>
                  <textarea
                    value={editOmschrijving}
                    onChange={(e) => setEditOmschrijving(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="shop-admin-form-full">
                  <label>
                    <input
                      type="checkbox"
                      checked={editActief}
                      onChange={(e) => setEditActief(e.target.checked)}
                    />{' '}
                    Actief
                  </label>
                </div>
              </div>
              <div className="shop-admin-form-actions">
                <button type="submit" disabled={saving}>
                  {saving ? 'Opslaan…' : 'Opslaan'}
                </button>
                <button type="button" onClick={cancelEdit}>
                  Annuleren
                </button>
              </div>
            </form>
          )}

          {/* Toevoegen */}
          <form className="shop-admin-form" onSubmit={handleAdd}>
            <h3>Nieuwe kaas toevoegen</h3>
            <div className="shop-admin-form-grid">
              <div>
                <label>Naam *</label>
                <input
                  type="text"
                  value={newNaam}
                  onChange={(e) => setNewNaam(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Categorie *</label>
                <select
                  value={newCategorie}
                  onChange={(e) =>
                    setNewCategorie(
                      e.target.value as
                        | 'Harde kazen'
                        | 'Zachte kazen'
                        | 'Geiten/Schapen'
                        | 'Specials'
                        | ''
                    )
                  }
                  required
                >
                  <option value="">Selecteer…</option>
                  <option value="Harde kazen">Harde kazen</option>
                  <option value="Zachte kazen">Zachte kazen</option>
                  <option value="Geiten/Schapen">Geiten/Schapen</option>
                  <option value="Specials">Specials</option>
                </select>
              </div>
              <div>
                <label>Prijs (€) *</label>
                <input
                  type="text"
                  value={newPrijs}
                  onChange={(e) => setNewPrijs(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Afbeelding (URL, optioneel)</label>
                <input
                  type="text"
                  value={newAfbeelding}
                  onChange={(e) => setNewAfbeelding(e.target.value)}
                />
              </div>
              <div className="shop-admin-form-full">
                <label>Omschrijving (optioneel)</label>
                <textarea
                  value={newOmschrijving}
                  onChange={(e) => setNewOmschrijving(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <div className="shop-admin-form-actions">
              <button type="submit" disabled={saving}>
                {saving ? 'Toevoegen…' : 'Kaas toevoegen'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
