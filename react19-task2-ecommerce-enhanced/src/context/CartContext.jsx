import { createContext, useContext, useState, useTransition, useOptimistic } from 'react';

export const CartContext = createContext(null);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartContext');
  }
  return context;
}

export function CartProvider({ children }) {
  const [actualCart, setActualCart] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [notification, setNotification] = useState(null);

  // React 19 useOptimistic:
  // Immediately reflects the item in the UI while the async server call is pending.
  const [optimisticCart, addOptimisticItem] = useOptimistic(
    actualCart,
    (currentList, newItem) => [
      ...currentList,
      { ...newItem, _optimisticKey: 'opt-' + Date.now(), isPendingOptimistic: true }
    ]
  );

  const addToCart = (product) => {
    startTransition(async () => {
      // Step 1: Immediately update optimistic state
      addOptimisticItem(product);

      try {
        // Step 2: Simulate asynchronous network latency (1.4 seconds)
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (simulateFailure) {
              reject(new Error("Database write failed (Simulated 500 error)"));
            } else {
              resolve({ ok: true });
            }
          }, 1400);
        });

        // Step 3: Success - commit to actual state
        setActualCart((prev) => [...prev, product]);
        setNotification({
          type: 'success',
          text: `Added "${product.name}" to cart!`
        });
      } catch (err) {
        // Step 4: Handle failure - actualCart was never changed,
        // so React automatically rolls back the optimistic state!
        setNotification({
          type: 'error',
          text: `Failed to add "${product.name}"! Rolling back optimistic cart update.`
        });
      }
    });
  };

  const removeFromCart = (indexToRemove) => {
    setActualCart((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const clearCart = () => {
    setActualCart([]);
  };

  const value = {
    cart: optimisticCart,
    actualCart,
    isPending,
    simulateFailure,
    setSimulateFailure,
    notification,
    clearNotification: () => setNotification(null),
    addToCart,
    removeFromCart,
    clearCart,
    cartCount: optimisticCart.length,
    actualCount: actualCart.length,
    hasOptimisticItems: optimisticCart.some((item) => item.isPendingOptimistic)
  };

  // React 19 syntax: <CartContext value={...}> without .Provider
  return (
    <CartContext value={value}>
      {children}
    </CartContext>
  );
}
