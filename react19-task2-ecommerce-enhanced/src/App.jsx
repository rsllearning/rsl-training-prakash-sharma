import { useState, Suspense } from 'react';
import { UserContextProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';
import { createProductsPromise } from './data/mockProducts';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import ProductSkeleton from './components/ProductSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import RegistrationForm from './components/RegistrationForm';
import CartDrawer from './components/CartDrawer';
import NotificationToast from './components/NotificationToast';
import ArchitectureView from './components/ArchitectureView';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productsPromise, setProductsPromise] = useState(() => createProductsPromise(false, 800));

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setActiveTab('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedProduct(null);
    setActiveTab('catalog');
  };

  const handleReloadCatalog = (fail = false) => {
    setProductsPromise(createProductsPromise(fail, 1000));
  };

  return (
    <UserContextProvider>
      <CartProvider>
        <div className="app-layout">
          <Header
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'details') setSelectedProduct(null);
            }}
            onOpenCart={() => setIsCartOpen(true)}
          />

          <NotificationToast />

          <div className="feature-banner">
            <div className="container banner-inner">
              <span className="pill pill-task2">React 19 Enhanced</span>
              <span className="banner-text">
                Featuring <code>useOptimistic()</code>, direct <code>ref</code> prop (no <code>forwardRef</code>), callback-ref cleanup, and RSC design.
              </span>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setActiveTab('architecture')}
              >
                📖 RSC &amp; Compiler Docs
              </button>
            </div>
          </div>

          <main className="container main-content">
            {activeTab === 'catalog' && (
              <>
                <div className="catalog-toolbar">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleReloadCatalog(false)}
                  >
                    🔄 Reload Catalog (Suspense)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => handleReloadCatalog(true)}
                  >
                    ⚠️ Test Error Boundary
                  </button>
                </div>

                <ErrorBoundary onReset={() => handleReloadCatalog(false)}>
                  <Suspense fallback={<ProductSkeleton />}>
                    <ProductList
                      productsPromise={productsPromise}
                      onSelectProduct={handleSelectProduct}
                    />
                  </Suspense>
                </ErrorBoundary>
              </>
            )}

            {activeTab === 'details' && selectedProduct && (
              <ProductDetails
                product={selectedProduct}
                onBack={handleBackToCatalog}
              />
            )}

            {activeTab === 'register' && (
              <RegistrationForm />
            )}

            {activeTab === 'architecture' && (
              <ArchitectureView />
            )}
          </main>

          <footer className="site-footer">
            <div className="container footer-content">
              <p>React 19 Features Assignment — Task 2 Enhanced Implementation</p>
              <p className="footer-sub">All deliverables: Product Details, useOptimistic Cart, Ref as Prop, Callback Ref Cleanup, RSC &amp; Compiler Documentation.</p>
            </div>
          </footer>

          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
          />
        </div>
      </CartProvider>
    </UserContextProvider>
  );
}
