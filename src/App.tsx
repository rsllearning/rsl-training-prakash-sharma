import { useState } from 'react';
import { Header } from './components/Header/Header';
import { Catalog } from './components/Catalog/Catalog';
import { CartDrawer } from './components/CartDrawer/CartDrawer';

export function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="app-shell">
      <Header onOpenCart={() => setIsCartOpen(true)} />
      <main className="main-content">
        <Catalog />
      </main>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default App;
