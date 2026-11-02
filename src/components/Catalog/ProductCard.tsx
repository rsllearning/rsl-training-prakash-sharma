import React from 'react';
import { useSetAtom } from 'jotai';
import type { Product } from '../../types';
import { addToCartAtom } from '../../atoms/cartAtoms';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  // Action-only hook: does not subscribe to value changes, never re-renders when cart changes!
  const addToCart = useSetAtom(addToCartAtom);

  return (
    <div className="product-card">
      <div>
        <div className="product-image-placeholder">📦</div>
        <h3 className="product-name">{product.name}</h3>
      </div>
      <div className="product-card-footer">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <button className="btn-primary" onClick={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
});
