import React from 'react';
import { useCartState } from '../../context/CartContext';

interface CartBadgeProps {
  onClick?: () => void;
}

export const CartBadge: React.FC<CartBadgeProps> = ({ onClick }) => {
  const { items } = useCartState();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button className="cart-badge-btn" onClick={onClick} aria-label="Shopping Cart">
      <span>🛒 Cart</span>
      <span className="cart-counter">{count}</span>
    </button>
  );
};
