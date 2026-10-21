import { useState, Suspense } from 'react';
import { UserContextProvider } from './context/UserContext';
import { createProductsPromise } from './data/mockProducts';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductSkeleton from './components/ProductSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import RegistrationForm from './components/RegistrationForm';
import UserProfile from './components/UserProfile';
import AssetExplanationModal from './components/AssetExplanationModal';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create an initial Promise for React 19 use()
  const [productsPromise, setProductsPromise] = useState(() => createProductsPromise(false, 1000));
  const [hasErrorMode, setHasErrorMode] = useState(false);

  const handleRefresh = (triggerError = false) => {
    setHasErrorMode(triggerError);
    setProductsPromise(createProductsPromise(triggerError, 1000));
  };

  return (
    <UserContextProvider>
      <div className="app-layout">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="feature-banner">
          <div className="container banner-inner">
            <span className="pill pill-react19">React 19 Active</span>
            <span className="banner-text">
              Demonstrating <code>use()</code>, <code>&lt;Suspense&gt;</code>, native metadata, <code>useActionState()</code>, <code>useFormStatus()</code> &amp; direct <code>&lt;Context value&gt;</code>.
            </span>
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => setIsModalOpen(true)}
            >
              ℹ️ View Asset API Specs
            </button>
          </div>
        </div>

        <main className="container main-content">
          <div className="layout-grid">
            <div className="primary-column">
              {activeTab === 'catalog' ? (
                <>
                  <div className="toolbar">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRefresh(false)}
                    >
                      🔄 Reload Catalog with Suspense
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${hasErrorMode ? 'btn-danger' : 'btn-outline'}`}
                      onClick={() => handleRefresh(true)}
                    >
                      ⚠️ Simulate API Error Handling
                    </button>
                  </div>

                  <ErrorBoundary onReset={() => handleRefresh(false)}>
                    <Suspense fallback={<ProductSkeleton />}>
                      <ProductList productsPromise={productsPromise} />
                    </Suspense>
                  </ErrorBoundary>
                </>
              ) : (
                <RegistrationForm />
              )}
            </div>

            <aside className="secondary-column">
              <div className="sticky-sidebar">
                <UserProfile />

                <div className="card guide-card">
                  <h4>💡 React 19 Implemented Features</h4>
                  <ul className="feature-checklist">
                    <li>
                      <span className="check">✓</span>
                      <div>
                        <strong><code>use()</code> API:</strong> Unwraps product promise natively inside render.
                      </div>
                    </li>
                    <li>
                      <span className="check">✓</span>
                      <div>
                        <strong><code>&lt;Suspense&gt;</code>:</strong> Coordinates loading fallback without manual <code>isLoading</code> state.
                      </div>
                    </li>
                    <li>
                      <span className="check">✓</span>
                      <div>
                        <strong>Document Metadata:</strong> Native <code>&lt;title&gt;</code> and <code>&lt;meta&gt;</code> tags hoisted automatically.
                      </div>
                    </li>
                    <li>
                      <span className="check">✓</span>
                      <div>
                        <strong>Asset Loading APIs:</strong> <code>preconnect</code> &amp; <code>preload</code> from <code>react-dom</code>.
                      </div>
                    </li>
                    <li>
                      <span className="check">✓</span>
                      <div>
                        <strong>Form Actions:</strong> <code>useActionState</code> &amp; <code>useFormStatus</code> with zero <code>onSubmit</code> handlers.
                      </div>
                    </li>
                    <li>
                      <span className="check">✓</span>
                      <div>
                        <strong>React 19 Context:</strong> Direct <code>&lt;UserContext value=...&gt;</code> without <code>.Provider</code>.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="site-footer">
          <div className="container footer-content">
            <p>React 19 Features Assignment — Task 1 Submission</p>
            <p className="footer-sub">Built with React 19, Vite, and Modern CSS</p>
          </div>
        </footer>

        <AssetExplanationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </UserContextProvider>
  );
}
