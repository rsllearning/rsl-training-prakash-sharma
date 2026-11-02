import React, { useEffect, useState } from 'react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface CatalogProps {
  onAddToCart?: (product: Product) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch catalog: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <section className="catalog-section">
      <div className="catalog-header">
        <h2 className="catalog-title">Explore Catalog</h2>
        <p className="catalog-subtitle">Top curated gadgets and developer desk essentials</p>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading products...</p>}
      {error && <div className="alert-error">{error}</div>}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
};
