import React, { useEffect } from 'react';
import { useCartStore, selectTotalPrice } from '../../store/cartStore';
import { CheckoutMachineContext } from '../../machines/CheckoutContext';

export const CartSynchronizer: React.FC = () => {
  const actorRef = CheckoutMachineContext.useActorRef();
  const items = useCartStore((state) => state.items);
  const total = useCartStore(selectTotalPrice);

  useEffect(() => {
    actorRef.send({
      type: 'CART_UPDATED',
      items,
      total,
    });
  }, [items, total, actorRef]);

  return null;
};
