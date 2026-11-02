import { atom } from 'jotai';
import type { CartItem, Product } from '../types';

// Primitive Atom
export const cartItemsAtom = atom<CartItem[]>([]);

// Derived Read-Only Atoms (recompute dynamically without duplicate state or useMemo)
export const totalCountAtom = atom<number>((get) =>
  get(cartItemsAtom).reduce((sum, item) => sum + item.quantity, 0)
);

export const totalPriceAtom = atom<number>((get) =>
  get(cartItemsAtom).reduce((sum, item) => sum + item.product.price * item.quantity, 0)
);

// Write-Only Action Atoms (components subscribing to these do NOT re-render on cart changes)
export const addToCartAtom = atom(
  null,
  (get, set, product: Product) => {
    const items = get(cartItemsAtom);
    const existingIndex = items.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1,
      };
      set(cartItemsAtom, updated);
    } else {
      set(cartItemsAtom, [...items, { product, quantity: 1 }]);
    }
  }
);

export const removeFromCartAtom = atom(
  null,
  (get, set, productId: string) => {
    const items = get(cartItemsAtom);
    set(
      cartItemsAtom,
      items.filter((item) => item.product.id !== productId)
    );
  }
);

export const clearCartAtom = atom(
  null,
  (_get, set) => {
    set(cartItemsAtom, []);
  }
);
