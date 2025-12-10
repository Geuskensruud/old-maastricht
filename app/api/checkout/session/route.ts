// app/api/checkout/session/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

type CartItem = {
  id: string;
  name: string;
  price: number; // in euro
  qty: number;
};

type Address = {
  straatHuisnummer: string;
  postcode: string;
  plaats: string;
  landRegio: string;
};

type Customer = {
  voornaam: string;
  achternaam: string;
  bedrijfsnaam?: string;
  email: string;
  telefoon: string;
  factuurAdres: Address;
  verzendAdres: Address;
  bestelnotities?: string;
};

export async function POST(req: Request) {
  try {
    const { items, customer } = (await req.json()) as {
      items?: CartItem[];
      customer?: Customer;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Geen producten in de bestelling.' },
        { status: 400 }
      );
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => ({
        quantity: item.qty,
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
      }));

    const origin = new URL(req.url).origin;

    const metadata: Record<string, string> = {};

    if (customer) {
      metadata['voornaam'] = customer.voornaam;
      metadata['achternaam'] = customer.achternaam;
      if (customer.bedrijfsnaam) metadata['bedrijfsnaam'] = customer.bedrijfsnaam;
      metadata['telefoon'] = customer.telefoon;
      metadata['factuur_straat'] = customer.factuurAdres.straatHuisnummer;
      metadata['factuur_postcode'] = customer.factuurAdres.postcode;
      metadata['factuur_plaats'] = customer.factuurAdres.plaats;
      metadata['factuur_land'] = customer.factuurAdres.landRegio;
      metadata['verzend_straat'] = customer.verzendAdres.straatHuisnummer;
      metadata['verzend_postcode'] = customer.verzendAdres.postcode;
      metadata['verzend_plaats'] = customer.verzendAdres.plaats;
      metadata['verzend_land'] = customer.verzendAdres.landRegio;
      if (customer.bestelnotities) metadata['bestelnotities'] = customer.bestelnotities;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['ideal'],
      line_items,
      success_url: `${origin}/betaald?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/afrekenen`,
      customer_email: customer?.email,
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout/session] error:', err);
    return NextResponse.json(
      { error: 'Kon betaal-sessie niet aanmaken.' },
      { status: 500 }
    );
  }
}
