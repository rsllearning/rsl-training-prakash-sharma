import { use } from 'react';
import { preload, preconnect, prefetchDNS } from 'react-dom';
import { useCart } from '../context/CartContext';

export default function ProductList({ productsPromise, onSelectProduct }) {
  // React 19 Asset Loading APIs
  preconnect('https://images.unsplash.com', { crossOrigin: 'anonymous' });
  prefetchDNS('https://images.unsplash.com');
  preload('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', {
    as: 'image'
  });

  // React 19 use() API to consume data promise
  const products = use(productsPromise);
  const { addToCart, isPending } = useCart();

  return (
    <section className="product-section">
      <title>Mini E-Commerce Store – Products</title>
      <meta
        name="description"
        content="Browse premium electronics and wearables with React 19 optimistic updates and ref handling."
      />

      <div className="section-header">
        <div>
          <h2>Featured Products</h2>
          <p className="section-subtitle">
            Click on any product to view full specifications, interactive ref demos, and optimistic cart actions.
          </p>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <div
              className="product-image-container clickable"
              onClick={() => onSelectProduct(product)}
            >
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

              <h3
                className="product-title clickable"
                onClick={() => onSelectProduct(product)}
              >
                {product.name}
              </h3>
              <p className="product-desc">{product.shortDescription}</p>

              <div className="product-footer">
                <span className="product-price">${product.price.toFixed(2)}</span>
                <div className="card-buttons-group">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => onSelectProduct(product)}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => addToCart(product)}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
