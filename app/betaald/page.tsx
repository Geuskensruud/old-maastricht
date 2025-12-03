// app/betaald/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Betaling geslaagd',
};

export default function BetaaldPage() {
  return (
    <main style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>
        Bedankt voor je bestelling!
      </h1>
      <p>
        Je iDEAL-betaling is afgerond. We sturen je bestelling zo snel mogelijk naar je toe.
      </p>
    </main>
  );
}
