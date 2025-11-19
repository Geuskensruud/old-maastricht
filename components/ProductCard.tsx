'use client';

import Image from 'next/image';
import { Product } from './products';
import { useCart } from './CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const format = (v: number) =>
    new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(v);

  // fallback afb.
  const imgSrc = product.image || '/products/fallback.jpg';

  return (
    <article className="product-card">
      <div className="product-thumb">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="product-img"
        />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}

        <div className="product-meta">
          <span className="product-price">{format(product.price)}</span>
          <button
            className="btn-add"
            onClick={() => addItem({ id: product.id, name: product.name, price: product.price }, 1)}
            aria-label={`Voeg ${product.name} toe aan winkelmand`}
          >
            In mandje
          </button>
        </div>
      </div>
    </article>
  );
}
