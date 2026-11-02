import React from 'react';
import { CheckoutMachineContext } from '../../machines/CheckoutContext';

export const CheckoutButton: React.FC = () => {
  const actorRef = CheckoutMachineContext.useActorRef();

  // Subscribes declaratively to whether the machine can transition on SUBMIT
  const canSubmit = CheckoutMachineContext.useSelector((state) =>
    state.can({ type: 'SUBMIT' })
  );

  const isSubmitting = CheckoutMachineContext.useSelector((state) =>
    state.matches('submitting')
  );

  return (
    <button
      className="btn-checkout"
      onClick={() => actorRef.send({ type: 'SUBMIT' })}
      disabled={!canSubmit || isSubmitting}
    >
      {isSubmitting ? 'Processing Payment...' : 'Proceed to Checkout'}
    </button>
  );
};
