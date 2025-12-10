// app/api/checkout/session/route.ts
import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

type CartItem = {
  id: string;
  name: string;
  price: number; // euro
  qty: number;
};

type CheckoutBody = {
  items: CartItem[];
  customer?: {
    email?: string;
    voornaam?: string;
    achternaam?: string;
    bedrijfsnaam?: string;
    telefoon?: string;

    factuurStraat?: string;
    factuurPostcode?: string;
    factuurPlaats?: string;
    factuurLand?: string;

    anderVerzendAdres?: boolean | string | number;
    verzendStraat?: string;
    verzendPostcode?: string;
    verzendPlaats?: string;
    verzendLand?: string;

    bestelnotities?: string;
  };
};

function parseOtherAddressFlag(
  raw: boolean | string | number | undefined
): boolean {
  if (raw === true) return true;
  if (raw === false) return false;
  if (typeof raw === 'number') return raw === 1;
  if (typeof raw === 'string') {
    const v = raw.toLowerCase().trim();
    return v === '1' || v === 'true' || v === 'on' || v === 'ja';
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;

    const items = body.items;
    const customer = body.customer || {};

    // Enige harde check: er moeten producten zijn
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Geen producten in winkelmandje.' },
        { status: 400 }
      );
    }

    const hasOtherAddress = parseOtherAddressFlag(customer.anderVerzendAdres);

    const factuurStraat = customer.factuurStraat || '';
    const factuurPostcode = customer.factuurPostcode || '';
    const factuurPlaats = customer.factuurPlaats || '';
    const factuurLand = customer.factuurLand || '';

    const verzendStraat = hasOtherAddress
      ? customer.verzendStraat || ''
      : factuurStraat;
    const verzendPostcode = hasOtherAddress
      ? customer.verzendPostcode || ''
      : factuurPostcode;
    const verzendPlaats = hasOtherAddress
      ? customer.verzendPlaats || ''
      : factuurPlaats;
    const verzendLand = hasOtherAddress
      ? customer.verzendLand || ''
      : factuurLand;

    const lineItems = items.map((item) => ({
      quantity: item.qty,
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
        },
      },
    }));

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000';

      console.log('stripe keys:', Object.keys(stripe));
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['ideal'],
      line_items: lineItems,
      customer_email: customer.email || undefined,
      success_url: `${origin}/betaald?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/afrekenen`,
      metadata: {
        voornaam: customer.voornaam || '',
        achternaam: customer.achternaam || '',
        bedrijfsnaam: customer.bedrijfsnaam || '',
        telefoon: customer.telefoon || '',

        factuur_straat: factuurStraat,
        factuur_postcode: factuurPostcode,
        factuur_plaats: factuurPlaats,
        factuur_land: factuurLand,

        verzend_straat: verzendStraat,
        verzend_postcode: verzendPostcode,
        verzend_plaats: verzendPlaats,
        verzend_land: verzendLand,

        bestelnotities: customer.bestelnotities || '',
        ander_verzendadres: hasOtherAddress ? '1' : '0',
      },
    } as any); // cast als any om type-gezeur te vermijden

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('[checkout/session] error:', err);
    return NextResponse.json(
      { error: 'Kon betaal-sessie niet aanmaken.' },
      { status: 500 }
    );
  }
}
