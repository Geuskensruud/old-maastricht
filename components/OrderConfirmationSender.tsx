'use client';

import { useEffect, useState } from 'react';

type Props = {
  sessionId: string;
};

/**
 * Roept éénmalig de API aan om een bestelbevestiging te mailen.
 * We gebruiken localStorage om te voorkomen dat we bij refresh meerdere mails sturen
 * vanaf dezelfde browser.
 */
export default function OrderConfirmationSender({ sessionId }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>(
    'idle'
  );

  useEffect(() => {
    if (!sessionId) return;

    const storageKey = `order_email_sent_${sessionId}`;

    // Als we al eerder vanaf deze browser hebben gemaild, niets doen
    if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
      return;
    }

    async function sendEmail() {
      try {
        setStatus('sending');
        const res = await fetch('/api/order/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          console.error('order/confirm failed', await res.text());
          setStatus('error');
          return;
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, '1');
        }
        setStatus('done');
      } catch (err) {
        console.error('[OrderConfirmationSender] error:', err);
        setStatus('error');
      }
    }

    sendEmail();
  }, [sessionId]);

  // Geen UI nodig; je kunt hier desnoods een kleine melding tonen als status === 'error'
  return null;
}
