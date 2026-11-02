import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCartStore, selectTotalPrice } from '../../store/cartStore';
import { CartItemsList } from './CartItemsList';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { itemsCount, checkoutStatus, checkoutError, checkout } = useCartStore(
    useShallow((state) => ({
      itemsCount: state.items.length,
      checkoutStatus: state.checkoutStatus,
      checkoutError: state.checkoutError,
      checkout: state.checkout,
    }))
  );

  const totalPrice = useCartStore(selectTotalPrice);

  if (!isOpen) return null;

  const isSubmitting = checkoutStatus === 'submitting';

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
          {checkoutError && <div className="alert-error">{checkoutError}</div>}
          {checkoutStatus === 'success' && (
            <div className="alert-success">Order placed successfully!</div>
          )}
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
            <button
              className="btn-checkout"
              onClick={checkout}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing Order...' : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
