// app/betaald/page.tsx
import BetaaldClient from './BetaaldClient';

type PageProps = {
  searchParams: Promise<{
    session_id?: string | string[];
  }>;
};

export default async function BetaaldPage({ searchParams }: PageProps) {
  const params = await searchParams;

  let sessionId = '';
  const raw = params.session_id;

  if (typeof raw === 'string') {
    sessionId = raw;
  } else if (Array.isArray(raw) && raw.length > 0) {
    sessionId = raw[0];
  }

  return <BetaaldClient sessionId={sessionId} />;
}
