import React from 'react';
import { useCartStore, selectTotalCount } from '../../store/cartStore';

interface CartBadgeProps {
  onClick?: () => void;
}

export const CartBadge: React.FC<CartBadgeProps> = ({ onClick }) => {
  const count = useCartStore(selectTotalCount);

  return (
    <button className="cart-badge-btn" onClick={onClick} aria-label="Shopping Cart">
      <span>🛒 Cart</span>
      <span className="cart-counter">{count}</span>
    </button>
  );
};
