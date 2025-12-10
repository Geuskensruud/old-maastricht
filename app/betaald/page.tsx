// app/betaald/page.tsx
import OrderConfirmationSender from '@/components/OrderConfirmationSender';

type SearchParams = {
  session_id?: string;
};

export default async function BetaaldPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <main style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>
        Bedankt voor je bestelling!
      </h1>
      <p style={{ marginBottom: '0.75rem' }}>
        Je iDEAL-betaling is afgerond. We gaan zo snel mogelijk met je bestelling aan de slag.
      </p>

      {/* Stuur e-mail op de achtergrond zodra de pagina is geladen */}
      {sessionId && <OrderConfirmationSender sessionId={sessionId} />}
    </main>
  );
}
