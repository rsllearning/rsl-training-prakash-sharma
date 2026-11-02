import { useState } from 'react';
import { CheckoutMachineContext } from './machines/CheckoutContext';
import { CartSynchronizer } from './components/Bridges/CartSynchronizer';
import { OrderCompletionBridge } from './components/Bridges/OrderCompletionBridge';
import { Header } from './components/Header/Header';
import { Catalog } from './components/Catalog/Catalog';
import { CartDrawer } from './components/CartDrawer/CartDrawer';
import { PaymentPanel } from './components/Payment/PaymentPanel';

export function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CheckoutMachineContext.Provider>
      {/* Headless Bridge Components */}
      <CartSynchronizer />
      <OrderCompletionBridge />

      <div className="app-shell">
        <Header onOpenCart={() => setIsCartOpen(true)} />

        <main className="main-content">
          <div className="layout-grid">
            <div className="catalog-area">
              <Catalog />
            </div>
            <aside className="payment-area">
              <PaymentPanel />
            </aside>
          </div>
        </main>

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CheckoutMachineContext.Provider>
  );
}

export default App;
