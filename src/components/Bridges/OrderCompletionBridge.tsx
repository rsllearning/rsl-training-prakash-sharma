import React, { useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { CheckoutMachineContext } from '../../machines/CheckoutContext';

export const OrderCompletionBridge: React.FC = () => {
  const actorRef = CheckoutMachineContext.useActorRef();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Subscribes to the machine's emitted events
    const subscription = actorRef.on('ORDER_COMPLETED', () => {
      clearCart();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [actorRef, clearCart]);

  return null;
};
