'use client';

import ProductCard from '@/components/ProductCard';
import type { Product } from '@/components/products';

type Props = {
  initialProducts: Product[];
};

export default function ShopClient({ initialProducts }: Props) {
  return (
    <main className="shop-page">
      <header className="shop-header">
        <h1 className="shop-title">Onze kazen</h1>
        <p className="shop-subtitle">
          Ontdek het assortiment Old Maastricht kazen – direct uit onze rijpingskamers.
        </p>
      </header>

      <section className="shop-grid-section">
        {initialProducts.length === 0 ? (
          <p className="shop-empty">
            Er zijn momenteel nog geen kazen beschikbaar.
          </p>
        ) : (
          <div className="shop-grid">
            {initialProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
