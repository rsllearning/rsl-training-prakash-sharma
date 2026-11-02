import React from 'react';
import { useAtomValue } from 'jotai';
import { totalCountAtom } from '../../atoms/cartAtoms';

interface CartBadgeProps {
  onClick?: () => void;
}

export const CartBadge: React.FC<CartBadgeProps> = ({ onClick }) => {
  const count = useAtomValue(totalCountAtom);

  return (
    <button className="cart-badge-btn" onClick={onClick} aria-label="Shopping Cart">
      <span>🛒 Cart</span>
      <span className="cart-counter">{count}</span>
    </button>
  );
};
