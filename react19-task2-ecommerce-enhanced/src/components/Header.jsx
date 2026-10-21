import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';

export default function Header({ activeTab, setActiveTab, onOpenCart }) {
  const { user, isLoggedIn } = useUser();
  const { cartCount, isPending, hasOptimisticItems } = useCart();

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-group" onClick={() => setActiveTab('catalog')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon">⚡</div>
          <div>
            <h1 className="logo-title">React 19 E-Commerce</h1>
            <span className="logo-subtitle">Task 2: Enhanced Cart, Refs &amp; Optimistic UI</span>
          </div>
        </div>

        <nav className="header-nav">
          <button
            type="button"
            className={`nav-link ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            📦 Catalog
          </button>
          <button
            type="button"
            className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            📝 Registration
          </button>
          <button
            type="button"
            className={`nav-link ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            🏛️ RSC &amp; Compiler
          </button>
        </nav>

        <div className="header-actions">
          {/* Cart Trigger with optimistic badge */}
          <button
            type="button"
            className={`cart-trigger-btn ${hasOptimisticItems ? 'cart-pulsing' : ''}`}
            onClick={onOpenCart}
            aria-label="View Cart"
          >
            <span className="cart-icon">🛒</span>
            <span className="cart-badge">{cartCount}</span>
            {isPending && <span className="sync-dot" title="Syncing via useOptimistic()..."></span>}
          </button>

          <div className="user-badge-header">
            {isLoggedIn ? (
              <div className="header-user-info">
                <span className="user-avatar-small">{user.name.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user.name}</span>
              </div>
            ) : (
              <span className="guest-badge">👤 Guest</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
