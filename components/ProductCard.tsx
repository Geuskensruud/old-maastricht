'use client';

import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import type { Product } from '@/components/products';

type ProductCardProps = {
  product: Product;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ProductCard({
  product,
  isAdmin,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
      },
      1
    );
  };

  return (
    <article className="product-card">
      <div className="product-thumb">
        <Image
          src={product.image ?? '/icons/cheese.png'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 25vw"
          className="product-img"
        />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}

        <div className="product-meta">
          <span className="product-price">
            € {product.price.toFixed(2).replace('.', ',')}
          </span>

          {isAdmin ? (
            <div className="product-admin-buttons">
              <button
                type="button"
                className="btn-add"
                onClick={onEdit}
              >
                Bewerken
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={onDelete}
              >
                Verwijderen
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-add"
              onClick={handleAddToCart}
            >
              In mandje
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
