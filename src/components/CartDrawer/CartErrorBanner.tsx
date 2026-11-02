import React from 'react';
import { CheckoutMachineContext } from '../../machines/CheckoutContext';

export const CartErrorBanner: React.FC = () => {
  // Leaf subscription: only re-renders when errorMessage changes
  const errorMessage = CheckoutMachineContext.useSelector(
    (state) => state.context.errorMessage
  );

  if (!errorMessage) return null;

  return <div className="alert-error">{errorMessage}</div>;
};
