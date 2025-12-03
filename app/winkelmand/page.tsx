// app/winkelmand/page.tsx
'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartContext';
import IdealPayButton from '@/components/IdealPayButton';

export default function WinkelmandPage() {
  const { items, total, addItem, removeItem, clear } = useCart();

  const hasItems = items.length > 0;

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1
        style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          color: '#521f0a',
        }}
      >
        Winkelmand
      </h1>

      {!hasItems ? (
        <>
          <p style={{ marginBottom: '1rem' }}>
            Je winkelmand is nog leeg.
          </p>
          <Link
            href="/shop"
            style={{
              display: 'inline-block',
              padding: '0.55rem 1.2rem',
              borderRadius: 999,
              border: 'none',
              background: '#c28b00',
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Ga naar de shop
          </Link>
        </>
      ) : (
        <>
          <section
            style={{
              borderRadius: 14,
              border: '1px solid #e6e1d8',
              background: '#fffef8',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.95rem',
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: 'left',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #e0d4c2',
                    }}
                  >
                    Product
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #e0d4c2',
                    }}
                  >
                    Prijs
                  </th>
                  <th
                    style={{
                      textAlign: 'center',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #e0d4c2',
                    }}
                  >
                    Aantal
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #e0d4c2',
                    }}
                  >
                    Subtotaal
                  </th>
                  <th
                    style={{
                      textAlign: 'right',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid #e0d4c2',
                    }}
                  >
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const subtotal = item.price * item.qty;
                  return (
                    <tr key={item.id}>
                      <td
                        style={{
                          padding: '0.75rem 0.25rem',
                          borderBottom: '1px solid #f0e6d8',
                        }}
                      >
                        {item.name}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 0.25rem',
                          textAlign: 'right',
                          borderBottom: '1px solid #f0e6d8',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        € {item.price.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 0.25rem',
                          textAlign: 'center',
                          borderBottom: '1px solid #f0e6d8',
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              addItem(
                                { id: item.id, name: item.name, price: item.price },
                                -1
                              )
                            }
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              border: '1px solid #d2c2ae',
                              background: '#fff',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            −
                          </button>
                          <span>{item.qty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              addItem(
                                { id: item.id, name: item.name, price: item.price },
                                1
                              )
                            }
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              border: '1px solid #d2c2ae',
                              background: '#fff',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 0.25rem',
                          textAlign: 'right',
                          borderBottom: '1px solid #f0e6d8',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        € {subtotal.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 0.25rem',
                          textAlign: 'right',
                          borderBottom: '1px solid #f0e6d8',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#b00020',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
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
          </section>

          {/* Totaal + acties */}
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#521f0a',
              }}
            >
              Totaal: € {total.toFixed(2)}
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              {/* Eventueel nog een link naar afrekenen met adresgegevens */}
              <Link
                href="/afrekenen"
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: 999,
                  border: '1px solid #c28b00',
                  background: '#fff',
                  color: '#c28b00',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Gegevens invullen
              </Link>

              {/* Leegmaken winkelmand */}
              <button
                type="button"
                onClick={clear}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: 999,
                  border: '1px solid #d0c3b3',
                  background: '#fff',
                  color: '#5c4940',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Winkelmand legen
              </button>
            </div>

            {/* iDEAL-betaalknop */}
            <IdealPayButton />
          </section>
        </>
      )}
    </main>
  );
}
