import { useCart } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, actualCart, removeFromCart, clearCart, isPending, cartCount } = useCart();

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-modal-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h3>🛒 Shopping Cart</h3>
            <span className="cart-badge-count">{cartCount} items</span>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {isPending && (
          <div className="optimistic-banner">
            <span className="spinner-blue"></span>
            <span><code>useOptimistic()</code>: Synchronizing updates with server...</span>
          </div>
        )}

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <span className="empty-icon">🛒</span>
              <h4>Your cart is empty</h4>
              <p>Add some products from the catalog to see optimistic updates in action.</p>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item, index) => (
                <div
                  key={item._optimisticKey || `${item.id}-${index}`}
                  className={`cart-item-row ${item.isPendingOptimistic ? 'item-optimistic-pending' : ''}`}
                >
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-meta">
                    <div className="cart-item-title-row">
                      <span className="cart-item-name">{item.name}</span>
                      {item.isPendingOptimistic && (
                        <span className="optimistic-tag">⚡ Optimistic State</span>
                      )}
                    </div>
                    <span className="cart-item-cat">{item.category}</span>
                    <span className="cart-item-price">${item.price.toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeFromCart(index)}
                    disabled={item.isPendingOptimistic}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="summary-row">
              <span>Optimistic Count:</span>
              <strong>{cartCount}</strong>
            </div>
            <div className="summary-row">
              <span>Committed Server Count:</span>
              <strong>{actualCart.length}</strong>
            </div>
            <div className="summary-row total-row">
              <span>Estimated Subtotal:</span>
              <span className="total-amount">${subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-actions-row">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={clearCart}
                disabled={isPending}
              >
                Clear Cart
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => alert("Checkout flow completed!")}
                disabled={isPending}
              >
                Checkout Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
