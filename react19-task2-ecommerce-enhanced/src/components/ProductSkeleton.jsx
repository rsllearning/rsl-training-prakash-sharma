export default function ProductSkeleton() {
  return (
    <div className="product-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="product-card skeleton-card">
          <div className="skeleton skeleton-image"></div>
          <div className="product-info">
            <div className="skeleton skeleton-badge"></div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-desc"></div>
            <div className="skeleton skeleton-desc short"></div>
            <div className="product-footer">
              <div className="skeleton skeleton-price"></div>
              <div className="skeleton skeleton-btn"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
