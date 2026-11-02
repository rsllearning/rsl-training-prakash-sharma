import React from 'react';
import { CheckoutMachineContext } from '../../machines/CheckoutContext';

export const PaymentPanel: React.FC = () => {
  const actorRef = CheckoutMachineContext.useActorRef();

  // Granular leaf subscriptions
  const currentStep = CheckoutMachineContext.useSelector((state) =>
    state.matches('submitting')
      ? 'submitting'
      : state.matches('success')
      ? 'success'
      : 'review'
  );

  const canSubmit = CheckoutMachineContext.useSelector((state) =>
    state.can({ type: 'SUBMIT' })
  );

  const orderId = CheckoutMachineContext.useSelector(
    (state) => state.context.orderId
  );

  const errorMessage = CheckoutMachineContext.useSelector(
    (state) => state.context.errorMessage
  );

  const total = CheckoutMachineContext.useSelector(
    (state) => state.context.total
  );

  const itemsCount = CheckoutMachineContext.useSelector(
    (state) => state.context.items.length
  );

  return (
    <div className="payment-panel-card">
      <div className="payment-panel-header">
        <div>
          <h3 className="payment-panel-title">Checkout & Payment Orchestrator</h3>
          <p className="payment-panel-desc">Powered by XState v5 Finite State Machine</p>
        </div>
        <div className={`status-badge status-${currentStep}`}>
          Step: <strong>{currentStep.toUpperCase()}</strong>
        </div>
      </div>

      <div className="payment-panel-body">
        {errorMessage && (
          <div className="alert-error">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {currentStep === 'review' && (
          <div className="payment-step-view">
            <p>
              Cart Items: <strong>{itemsCount}</strong> | Total Due:{' '}
              <strong>${total.toFixed(2)}</strong>
            </p>
            {itemsCount === 0 ? (
              <p className="hint-text">Add products to your cart to enable checkout submission.</p>
            ) : (
              <p className="hint-text">
                Ready for payment. Clicking "Submit Payment" will trigger an asynchronous API order with an artificial network delay.
              </p>
            )}
            <div className="action-row">
              <button
                className="btn-primary"
                onClick={() => actorRef.send({ type: 'SUBMIT' })}
                disabled={!canSubmit}
              >
                Submit Payment (${total.toFixed(2)})
              </button>
            </div>
          </div>
        )}

        {currentStep === 'submitting' && (
          <div className="payment-step-view">
            <div className="processing-indicator">
              <span className="spinner">⏳</span>
              <div>
                <strong>Processing payment of ${total.toFixed(2)} with json-server...</strong>
                <p className="hint-text">
                  Mid-flight cancellation enabled. Click "Cancel" to abort the HTTP request via native AbortSignal.
                </p>
              </div>
            </div>
            <div className="action-row">
              <button
                className="btn-danger"
                onClick={() => actorRef.send({ type: 'CANCEL' })}
              >
                ✕ Cancel Payment (Abort Request)
              </button>
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <div className="payment-step-view">
            <div className="alert-success">
              🎉 <strong>Payment Successful!</strong> Order ID: <code>#{orderId}</code>
              <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                Your order has been recorded in <code>db.json</code>. The Zustand store was automatically cleared via OrderCompletionBridge.
              </p>
            </div>
            <div className="action-row">
              <button
                className="btn-secondary"
                onClick={() => actorRef.send({ type: 'RESET' })}
              >
                Start New Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
