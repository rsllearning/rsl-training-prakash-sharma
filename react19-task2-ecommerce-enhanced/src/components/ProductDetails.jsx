import { useRef } from 'react';
import { useCart } from '../context/CartContext';
import CustomInput from './CustomInput';
import ElementDimensionObserver from './ElementDimensionObserver';

export default function ProductDetails({ product, onBack }) {
  const { addToCart, isPending, simulateFailure, setSimulateFailure } = useCart();

  // Create standard refs to demonstrate "Ref as a Prop" (no forwardRef!)
  const promoInputRef = useRef(null);
  const specsSectionRef = useRef(null);

  const handleFocusPromo = () => {
    if (promoInputRef.current) {
      promoInputRef.current.focus();
    }
  };

  const handleScrollToSpecs = () => {
    if (specsSectionRef.current) {
      specsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="product-details-container">
      {/* React 19 Document Metadata for the selected product */}
      <title>{`${product.name} — Details & Specs`}</title>
      <meta
        name="description"
        content={`Buy ${product.name} for $${product.price}. ${product.shortDescription}`}
      />

      <div className="details-navigation">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          ← Back to Catalog
        </button>
        <span className="breadcrumb">Catalog / {product.category} / <strong>{product.name}</strong></span>
      </div>

      <div className="details-hero-card">
        <div className="details-image-wrapper">
          <img
            src={product.image}
            alt={product.name}
            className="details-image"
          />
          <span className="details-category-pill">{product.category}</span>
        </div>

        <div className="details-info-panel">
          <div className="details-rating-badge">
            <span className="star">★</span> {product.rating} / 5.0
            <span className="reviews">({product.reviewsCount} customer reviews)</span>
          </div>

          <h2 className="details-title">{product.name}</h2>
          <div className="details-price-row">
            <span className="details-price">${product.price.toFixed(2)}</span>
            <span className="details-stock-status">In Stock ({product.stock} units available)</span>
          </div>

          <p className="details-description">{product.fullDescription}</p>

          <div className="quick-actions-bar">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleFocusPromo}
            >
              🎯 Focus Promo Input (Ref as Prop)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleScrollToSpecs}
            >
              📜 Scroll to Specs (Ref as Prop)
            </button>
          </div>

          {/* Add to Cart with useOptimistic */}
          <div className="cart-action-section">
            <div className="action-buttons-row">
              <button
                type="button"
                className={`btn btn-primary btn-lg add-to-cart-btn ${isPending ? 'btn-optimistic-loading' : ''}`}
                onClick={() => addToCart(product)}
              >
                {isPending ? (
                  <>
                    <span className="spinner"></span>
                    <span>Syncing with Server...</span>
                  </>
                ) : (
                  <span>🛒 Add to Cart (useOptimistic)</span>
                )}
              </button>
            </div>

            {/* Interactive failure simulation toggle */}
            <div className="failure-toggle-box">
              <label className="failure-label">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                />
                <span className="toggle-text">
                  ⚠️ Simulate Server Failure (Tests <code>useOptimistic()</code> rollback &amp; error recovery)
                </span>
              </label>
            </div>
          </div>

          {/* Demonstration of Ref as a Prop (Without forwardRef!) */}
          <div className="promo-input-demo">
            {/* CustomInput directly receives `ref={promoInputRef}` as a standard prop! */}
            <CustomInput
              ref={promoInputRef}
              label="Have a discount code? (Demonstrates Ref as a Prop)"
              placeholder="e.g. REACT19_LAUNCH"
              helperText="In React 19, ref is accepted directly as a prop without forwardRef()."
              icon="🏷️"
            />
          </div>
        </div>
      </div>

      {/* Product Specifications section targetable via ref */}
      <section ref={specsSectionRef} className="specs-section card">
        <h3>📋 Technical Highlights &amp; Specifications</h3>
        <p className="section-sub">Scrolled directly into view using standard React 19 Ref prop.</p>
        <ul className="features-list">
          {product.features?.map((feat, index) => (
            <li key={index} className="feature-item">
              <span className="check-icon">✓</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Ref Cleanup Feature Demonstration */}
      <ElementDimensionObserver targetProduct={product} />
    </div>
  );
}
