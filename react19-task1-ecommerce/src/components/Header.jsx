import { useUser } from '../context/UserContext';

export default function Header({ activeTab, setActiveTab }) {
  const { user, isLoggedIn } = useUser();

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-group">
          <div className="logo-icon">🛍️</div>
          <div>
            <h1 className="logo-title">React 19 E-Commerce</h1>
            <span className="logo-subtitle">Task 1: Core Flow &amp; Async Handling</span>
          </div>
        </div>

        <nav className="header-nav">
          <button
            type="button"
            className={`nav-link ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            📦 Products Catalog
          </button>
          <button
            type="button"
            className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            📝 User Registration
          </button>
        </nav>

        <div className="user-badge-header">
          {isLoggedIn ? (
            <div className="header-user-info">
              <span className="user-avatar-small">{user.name.charAt(0).toUpperCase()}</span>
              <div className="user-text">
                <span className="user-name">{user.name}</span>
                <span className="user-status-text">Logged in (Context)</span>
              </div>
            </div>
          ) : (
            <span className="guest-badge">👤 Guest Mode</span>
          )}
        </div>
      </div>
    </header>
  );
}
