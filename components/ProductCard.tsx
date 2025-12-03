'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useCart } from '@/components/CartContext';
import type { Product } from '@/components/products';

type Props = {
  product: Product;
  onAdminEdit?: () => void;
  onAdminDelete?: () => void;
};

export default function ProductCard({ product, onAdminEdit, onAdminDelete }: Props) {
  const { data: session } = useSession();
  const userAny = session?.user as any;
  const isAdmin = !!userAny?.isAdmin;

  const { addItem } = useCart();

  const handleAddToCart = () =>
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
      },
      1
    );

  const handleAdminEdit = () => {
    if (onAdminEdit) onAdminEdit();
  };

  const handleAdminDelete = () => {
    if (onAdminDelete) onAdminDelete();
  };

  return (
    <article className="product-card">
      <div className="product-thumb">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="product-img"
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}

        <div className="product-meta">
          <span className="product-price">
            € {product.price.toFixed(2)}
          </span>

          {/* Niet-admin: gewone "In mandje"-knop */}
          {!isAdmin ? (
            <button
              type="button"
              className="btn-add"
              onClick={handleAddToCart}
            >
              In mandje
            </button>
          ) : (
            // Admin: "Bewerken" + "Verwijderen"
            <div className="product-admin-actions">
              <button
                type="button"
                className="product-admin-btn"
                onClick={handleAdminEdit}
              >
                Bewerken
              </button>
              <button
                type="button"
                className="product-admin-btn product-admin-btn--secondary"
                onClick={handleAdminDelete}
              >
                Verwijderen
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
