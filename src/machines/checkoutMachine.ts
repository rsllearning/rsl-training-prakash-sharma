import { setup, fromPromise, assign, emit } from 'xstate';
import type { CartItem } from '../types';

export interface CheckoutContext {
  items: CartItem[];
  total: number;
  orderId: string | number | null;
  errorMessage: string | null;
}

export type CheckoutEvent =
  | { type: 'CART_UPDATED'; items: CartItem[]; total: number }
  | { type: 'SUBMIT' }
  | { type: 'CANCEL' }
  | { type: 'RESET' };

export type CheckoutEmitted = {
  type: 'ORDER_COMPLETED';
  orderId: string | number;
};

// Asynchronous Payment Actor with Native AbortSignal Support
const submitPaymentActor = fromPromise<
  { id: string | number; items: CartItem[]; total: number },
  { items: CartItem[]; total: number }
>(async ({ input, signal }) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: input.items,
      total: input.total,
      createdAt: new Date().toISOString(),
    }),
    signal, // Native browser AbortSignal from XState v5
  });

  if (!response.ok) {
    throw new Error(`Order checkout failed: HTTP ${response.status} ${response.statusText}`);
  }

  return response.json();
});

export const checkoutMachine = setup({
  types: {
    context: {} as CheckoutContext,
    events: {} as CheckoutEvent,
    emitted: {} as CheckoutEmitted,
  },
  actors: {
    submitPaymentActor,
  },
  guards: {
    canSubmit: ({ context }) => context.items.length > 0,
  },
}).createMachine({
  id: 'checkout',
  initial: 'review',
  context: {
    items: [],
    total: 0,
    orderId: null,
    errorMessage: null,
  },
  states: {
    review: {
      on: {
        CART_UPDATED: {
          actions: assign({
            items: ({ event }) => event.items,
            total: ({ event }) => event.total,
          }),
        },
        SUBMIT: {
          guard: 'canSubmit',
          target: 'submitting',
          actions: assign({ errorMessage: null }),
        },
      },
    },
    submitting: {
      invoke: {
        id: 'submit-payment-actor',
        src: 'submitPaymentActor',
        input: ({ context }) => ({
          items: context.items,
          total: context.total,
        }),
        onDone: {
          target: 'success',
          actions: assign({
            orderId: ({ event }) => event.output.id,
            errorMessage: null,
          }),
        },
        onError: {
          target: 'review',
          actions: assign({
            errorMessage: ({ event }) =>
              event.error instanceof Error ? event.error.message : String(event.error),
          }),
        },
      },
      on: {
        CANCEL: {
          target: 'review',
          actions: assign({ errorMessage: null }),
        },
        CART_UPDATED: {
          actions: assign({
            items: ({ event }) => event.items,
            total: ({ event }) => event.total,
          }),
        },
      },
    },
    success: {
      entry: emit(({ context }) => ({
        type: 'ORDER_COMPLETED' as const,
        orderId: context.orderId ?? 'N/A',
      })),
      on: {
        RESET: {
          target: 'review',
          actions: assign({
            orderId: null,
            errorMessage: null,
          }),
        },
        CART_UPDATED: {
          actions: assign({
            items: ({ event }) => event.items,
            total: ({ event }) => event.total,
          }),
        },
      },
    },
  },
});
