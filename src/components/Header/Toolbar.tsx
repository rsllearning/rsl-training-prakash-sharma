import React from 'react';
import { CartBadge } from './CartBadge';

interface ToolbarProps {
  onOpenCart?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenCart }) => {
  return (
    <div className="toolbar">
      <CartBadge onClick={onOpenCart} />
    </div>
  );
};
