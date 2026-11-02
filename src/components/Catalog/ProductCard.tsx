import React from 'react';
import type { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  // Subscribes STRICTLY to the action function - reference-stable, never triggers re-render on cart mutations!
  const addToCart = useCartStore((state) => state.addToCart);

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
