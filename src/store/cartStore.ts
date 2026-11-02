import { create } from 'zustand';
import type { CartItem, Product } from '../types';

export type CheckoutStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface CartStoreState {
  items: CartItem[];
  checkoutStatus: CheckoutStatus;
  checkoutError: string | null;

  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  resetCheckoutStatus: () => void;
}

export const useCartStore = create<CartStoreState>((set, get) => ({
  items: [],
  checkoutStatus: 'idle',
  checkoutError: null,

  addToCart: (product: Product) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id
      );
      if (existingIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
        };
        return { items: updatedItems };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    });
  },

  removeFromCart: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  resetCheckoutStatus: () => {
    set({ checkoutStatus: 'idle', checkoutError: null });
  },

  checkout: async () => {
    const { items } = get();
    if (items.length === 0) return;

    set({ checkoutStatus: 'submitting', checkoutError: null });

    const total = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Checkout failed: ${response.statusText}`);
      }

      set({ items: [], checkoutStatus: 'success', checkoutError: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout encountered an error';
      set({ checkoutStatus: 'error', checkoutError: message });
    }
  },
}));

// Derived Selectors (not duplicated in store state)
export const selectTotalPrice = (state: CartStoreState): number =>
  state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

export const selectTotalCount = (state: CartStoreState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
