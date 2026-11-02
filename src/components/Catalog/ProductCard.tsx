import React from 'react';
import type { Product } from '../../types';
import { useCartDispatch } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const dispatch = useCartDispatch();

  const handleAdd = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  return (
    <div className="product-card">
      <div>
        <div className="product-image-placeholder">📦</div>
        <h3 className="product-name">{product.name}</h3>
      </div>
      <div className="product-card-footer">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <button className="btn-primary" onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </div>
  );
});
