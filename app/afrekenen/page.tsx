'use client';

import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import './Afrekenen.css';

export default function AfrekenenPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();

  const [useDifferentShipping, setUseDifferentShipping] = useState(false);

  const [form, setForm] = useState({
    // Factuuradres
    voornaam: '',
    achternaam: '',
    bedrijfsnaam: '',
    email: '',
    telefoon: '',
    land: 'Nederland',
    straat: '',
    postcode: '',
    plaats: '',
    bestelnotities: '',
    // Verzendadres (optioneel)
    ship_land: 'Nederland',
    ship_straat: '',
    ship_postcode: '',
    ship_plaats: '',
  });

  const landen = ['Nederland', 'België', 'Duitsland'] as const;

  const format = (v: number) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(v);

  const verzendkosten = 0;
  const subtotaal = useMemo(() => total, [total]);
  const eindtotaal = useMemo(() => subtotaal + verzendkosten, [subtotaal, verzendkosten]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Je winkelmand is leeg!');
      return;
    }

    // stuur bevestigingsmail via API route
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          voornaam: form.voornaam,
          achternaam: form.achternaam,
          telefoon: form.telefoon,
          producten: items.map((p) => ({ name: p.name, qty: p.qty, price: p.price })),
          totaal: total,
          // optioneel: adresinfo meesturen
          factuuradres: {
            voornaam: form.voornaam,
            achternaam: form.achternaam,
            bedrijfsnaam: form.bedrijfsnaam,
            email: form.email,
            telefoon: form.telefoon,
            land: form.land,
            straat: form.straat,
            postcode: form.postcode,
            plaats: form.plaats,
            bestelnotities: form.bestelnotities,
          },
          verzendadres: useDifferentShipping
            ? {
                land: form.ship_land,
                straat: form.ship_straat,
                postcode: form.ship_postcode,
                plaats: form.ship_plaats,
              }
            : null,
        }),
      });

      if (!res.ok) {
        throw new Error('Mail verzenden mislukte');
      }

      alert(
        `Bedankt ${form.voornaam}! Je bestelling is geplaatst en een bevestiging is verzonden naar ${form.email}.`
      );
      clear();
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Er ging iets mis bij het plaatsen van je bestelling. Probeer het opnieuw.');
    }
  };

  return (
    <section className="checkout-wrap">
      <h1 className="checkout-title">Afrekenen</h1>

      {items.length === 0 ? (
        <p>
          Je winkelmand is leeg. Ga terug naar de{' '}
          <a href="/shop" className="link-shop">shop</a> om producten toe te voegen.
        </p>
      ) : (
        <>
          {/* ========== BESTELOVERZICHT ========== */}
          <div className="order-summary">
            <h2>Besteloverzicht</h2>
            <div className="table-container">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Prijs</th>
                    <th>Aantal</th>
                    <th className="text-right">Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.name}</td>
                      <td>{format(it.price)}</td>
                      <td>x {it.qty}</td>
                      <td className="text-right"><strong>{format(it.price * it.qty)}</strong></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="tfoot-label">Subtotaal</td>
                    <td className="text-right"><strong>{format(subtotaal)}</strong></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="tfoot-label">Verzendkosten</td>
                    <td className="text-right">{format(verzendkosten)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="tfoot-label total"><strong>Totaal te betalen</strong></td>
                    <td className="text-right total"><strong>{format(eindtotaal)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ========== FACTUUR- & VERZENDGEGEVENS ========== */}
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Factuur- & verzendgegevens</h2>

            {/* Naam */}
            <div className="row-2">
              <div>
                <label htmlFor="voornaam">Voornaam *</label>
                <input
                  id="voornaam"
                  required
                  value={form.voornaam}
                  onChange={(e) => setForm({ ...form, voornaam: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="achternaam">Achternaam *</label>
                <input
                  id="achternaam"
                  required
                  value={form.achternaam}
                  onChange={(e) => setForm({ ...form, achternaam: e.target.value })}
                />
              </div>
            </div>

            {/* Bedrijfsnaam */}
            <div>
              <label htmlFor="bedrijfsnaam">Bedrijfsnaam</label>
              <input
                id="bedrijfsnaam"
                value={form.bedrijfsnaam}
                onChange={(e) => setForm({ ...form, bedrijfsnaam: e.target.value })}
              />
            </div>

            {/* Contact: email en telefoon */}
            <div className="row-2">
              <div>
                <label htmlFor="email">E-mail *</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="telefoon">Telefoon *</label>
                <input
                  id="telefoon"
                  type="tel"
                  required
                  value={form.telefoon}
                  onChange={(e) => setForm({ ...form, telefoon: e.target.value })}
                />
              </div>
            </div>

            {/* Adres */}
            <div>
              <label htmlFor="land">Land / regio</label>
              <select
                id="land"
                value={form.land}
                onChange={(e) => setForm({ ...form, land: e.target.value })}
                required
              >
                {landen.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="straat">Straatnaam & huisnummer *</label>
              <input
                id="straat"
                required
                value={form.straat}
                onChange={(e) => setForm({ ...form, straat: e.target.value })}
              />
            </div>

            <div className="row-2">
              <div>
                <label htmlFor="postcode">Postcode *</label>
                <input
                  id="postcode"
                  required
                  value={form.postcode}
                  onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="plaats">Plaats *</label>
                <input
                  id="plaats"
                  required
                  value={form.plaats}
                  onChange={(e) => setForm({ ...form, plaats: e.target.value })}
                />
              </div>
            </div>

            {/* Ander verzendadres */}
            <div className="checkbox-row">
              <input
                id="useDifferentShipping"
                type="checkbox"
                checked={useDifferentShipping}
                onChange={(e) => setUseDifferentShipping(e.target.checked)}
              />
              <label htmlFor="useDifferentShipping">Versturen naar een ander adres?</label>
            </div>

            {useDifferentShipping && (
              <div className="shipping-fields">
                <div>
                  <label htmlFor="ship_land">Land / regio</label>
                  <select
                    id="ship_land"
                    value={form.ship_land}
                    onChange={(e) => setForm({ ...form, ship_land: e.target.value })}
                    required
                  >
                    {landen.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ship_straat">Straatnaam & huisnummer *</label>
                  <input
                    id="ship_straat"
                    value={form.ship_straat}
                    onChange={(e) => setForm({ ...form, ship_straat: e.target.value })}
                    required={useDifferentShipping}
                  />
                </div>

                <div className="row-2">
                  <div>
                    <label htmlFor="ship_postcode">Postcode *</label>
                    <input
                      id="ship_postcode"
                      value={form.ship_postcode}
                      onChange={(e) => setForm({ ...form, ship_postcode: e.target.value })}
                      required={useDifferentShipping}
                    />
                  </div>
                  <div>
                    <label htmlFor="ship_plaats">Plaats *</label>
                    <input
                      id="ship_plaats"
                      value={form.ship_plaats}
                      onChange={(e) => setForm({ ...form, ship_plaats: e.target.value })}
                      required={useDifferentShipping}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bestelnotities */}
            <div>
              <label htmlFor="bestelnotities">Bestelnotities</label>
              <textarea
                id="bestelnotities"
                rows={4}
                placeholder="Bijv. leveringsvoorkeur of opmerking"
                value={form.bestelnotities}
                onChange={(e) => setForm({ ...form, bestelnotities: e.target.value })}
              />
            </div>

            {/* Totaal & knop */}
            <div className="checkout-footer">
              <strong>Totaal: {format(eindtotaal)}</strong>
              <button type="submit" className="btn-submit">Bestelling plaatsen</button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
