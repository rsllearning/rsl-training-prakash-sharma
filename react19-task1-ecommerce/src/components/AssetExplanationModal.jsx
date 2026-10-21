export default function AssetExplanationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚡ React 19 Asset Loading APIs Explained</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p>
            React 19 introduces native asset loading APIs in <code>react-dom</code>. 
            This project uses the following selected APIs:
          </p>
          <div className="api-card">
            <h4>1. <code>preconnect('https://images.unsplash.com', &#123; crossOrigin: 'anonymous' &#125;)</code></h4>
            <p>
              <strong>Why Selected:</strong> Informs the browser to establish an early TCP connection and TLS handshake 
              with the Unsplash image CDN domain long before the product images are requested. This completely eliminates 
              round-trip network negotiation delay for image assets.
            </p>
          </div>
          <div className="api-card">
            <h4>2. <code>preload('...', &#123; as: 'image' &#125;)</code></h4>
            <p>
              <strong>Why Selected:</strong> High-priority hero/featured product images are preloaded so they start 
              downloading in parallel with component rendering, optimizing <em>Largest Contentful Paint (LCP)</em>.
            </p>
          </div>
          <div className="api-card">
            <h4>3. <code>prefetchDNS('https://images.unsplash.com')</code></h4>
            <p>
              <strong>Why Selected:</strong> Resolves the DNS for external asset servers ahead of time with zero network overhead.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
