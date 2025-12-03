// app/api/checkout/session/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe'; // ⬅️ HIER de type-import

type CartItem = {
  id: string;
  name: string;
  price: number; // in euro
  qty: number;
};

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as { items?: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Geen producten in de bestelling.' },
        { status: 400 }
      );
    }

    // Line-items voor Stripe Checkout (in centen)
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

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['ideal'], // iDEAL als betaalmethode
      line_items,
      success_url: `${origin}/betaald?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/winkelmand`,
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
