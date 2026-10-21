import { use } from 'react';
import { preload, preconnect, prefetchDNS } from 'react-dom';

export default function ProductList({ productsPromise }) {
  // React 19 Asset Loading APIs:
  // 1. preconnect: Informs browser to initiate early TLS/TCP handshake to Unsplash CDN
  preconnect('https://images.unsplash.com', { crossOrigin: 'anonymous' });

  // 2. prefetchDNS: Performs early DNS resolution for asset origins
  prefetchDNS('https://images.unsplash.com');

  // 3. preload: Preloads high-priority hero image asset to improve Largest Contentful Paint (LCP)
  preload('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', {
    as: 'image'
  });

  // React 19 use() API: Consumes the promise directly inside render.
  // Component suspends until promise resolves.
  const products = use(productsPromise);

  return (
    <section className="product-section">
      {/* React 19 Native Document Metadata Support - Hoisted to <head> automatically */}
      <title>Mini E-Commerce Store – Products</title>
      <meta
        name="description"
        content="Discover cutting-edge gadgets and accessories with our React 19 powered storefront."
      />

      <div className="section-header">
        <div>
          <h2>Featured Products Catalog</h2>
          <p className="section-subtitle">
            Loaded asynchronously via React 19's <code>use()</code> API &amp; <code>&lt;Suspense&gt;</code>.
          </p>
        </div>
        <div className="asset-tag-badge">
          <span>⚡ Asset Loading Active: <code>preconnect</code> &amp; <code>preload</code></span>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <div className="product-image-container">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="product-image"
              />
              <span className="category-tag">{product.category}</span>
            </div>

            <div className="product-info">
              <div className="rating-row">
                <span className="rating-star">★</span>
                <span className="rating-score">{product.rating}</span>
                <span className="stock-status">({product.stock} in stock)</span>
              </div>

              <h3 className="product-title">{product.name}</h3>
              <p className="product-desc">{product.shortDescription}</p>

              <div className="product-footer">
                <span className="product-price">${product.price.toFixed(2)}</span>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => alert(`Selected ${product.name} - View Details in Task 2!`)}
                >
                  Quick View
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
