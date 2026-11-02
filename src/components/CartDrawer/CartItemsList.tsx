import React from 'react';
import { useCartState, useCartDispatch } from '../../context/CartContext';

export const CartItemsList: React.FC = () => {
  const { items } = useCartState();
  const dispatch = useCartDispatch();

  if (items.length === 0) {
    return (
      <div className="empty-cart-view">
        <div className="empty-cart-icon">🛒</div>
        <h4>Your cart is empty</h4>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
          Explore our catalog and add items to your shopping cart.
        </p>
      </div>
    );
  }

  return (
    <div className="cart-items-list">
      {items.map((item) => (
        <div key={item.product.id} className="cart-item-row">
          <div className="cart-item-info">
            <h4 className="cart-item-title">{item.product.name}</h4>
            <div className="cart-item-meta">
              Qty: {item.quantity} × ${item.product.price.toFixed(2)} = ${(item.quantity * item.product.price).toFixed(2)}
            </div>
          </div>
          <div className="cart-item-actions">
            <button
              className="btn-remove"
              onClick={() =>
                dispatch({
                  type: 'REMOVE_ITEM',
                  payload: { productId: item.product.id },
                })
              }
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
