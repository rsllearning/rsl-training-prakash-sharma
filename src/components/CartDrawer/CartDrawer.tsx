import React, { useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { cartItemsAtom, totalPriceAtom, clearCartAtom } from '../../atoms/cartAtoms';
import { CartItemsList } from './CartItemsList';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const items = useAtomValue(cartItemsAtom);
  const totalPrice = useAtomValue(totalPriceAtom);
  const clearCart = useSetAtom(clearCartAtom);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      clearCart();
      alert('Order successfully placed!');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error during checkout';
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
