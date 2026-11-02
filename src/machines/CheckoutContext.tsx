import { createActorContext } from '@xstate/react';
import { checkoutMachine } from './checkoutMachine';

export const CheckoutMachineContext = createActorContext(checkoutMachine);
