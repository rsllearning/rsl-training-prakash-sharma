import React from 'react';
import { useCartStore, selectTotalPrice } from '../../store/cartStore';
import { CartItemsList } from './CartItemsList';
import { CartErrorBanner } from './CartErrorBanner';
import { CheckoutButton } from './CheckoutButton';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const itemsCount = useCartStore((state) => state.items.length);
  const totalPrice = useCartStore(selectTotalPrice);

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 className="drawer-title">Shopping Cart</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close cart">
            &times;
          </button>
        </div>

        <div className="drawer-content">
          <CartErrorBanner />
          <CartItemsList />
        </div>

        {itemsCount > 0 && (
          <div className="drawer-footer">
            <div className="price-summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="price-summary-row">
              <span>Estimated Shipping</span>
              <span style={{ color: 'var(--success)' }}>FREE</span>
            </div>
            <div className="price-summary-total">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <CheckoutButton />
          </div>
        )}
      </div>
    </div>
  );
};
