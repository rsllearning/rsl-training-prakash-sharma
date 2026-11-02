import React, { useState } from 'react';
import { useCartState, useCartDispatch } from '../../context/CartContext';
import { CartItemsList } from './CartItemsList';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items } = useCartState();
  const dispatch = useCartDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setCheckoutError(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total: totalPrice,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error(`Order checkout failed: ${response.statusText}`);
      }
      dispatch({ type: 'CLEAR_CART' });
      alert('Order successfully placed!');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error occurred during checkout';
      setCheckoutError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <CartItemsList />
        </div>

        {items.length > 0 && (
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
              onClick={handleCheckout}
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
