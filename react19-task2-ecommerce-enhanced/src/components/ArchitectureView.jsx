export default function ArchitectureView() {
  return (
    <div className="architecture-container">
      <div className="section-header">
        <div>
          <h2>React 19 Architecture &amp; System Design</h2>
          <p className="section-subtitle">
            Deep dive into React Server Components (RSC) and the React Compiler.
          </p>
        </div>
      </div>

      <div className="arch-cards-grid">
        {/* Server & Client Components Division */}
        <div className="card arch-card">
          <div className="arch-badge server-badge">React Server Components (RSC)</div>
          <h3>1. Why Product Details Can Be a Server Component</h3>
          <p>
            The Product Details page/view (title, description, specifications, image gallery, customer reviews) is predominantly <strong>static, read-heavy data</strong>.
          </p>
          <ul className="arch-points">
            <li><strong>Zero Client Bundle Size:</strong> Rendering it on the server sends pure pre-rendered HTML to the client, keeping JavaScript bundle size at 0 KB for the details display logic.</li>
            <li><strong>Direct Data Access:</strong> Can query databases or internal microservices directly with zero client API round-trips.</li>
            <li><strong>SEO &amp; First Contentful Paint:</strong> Delivers instant HTML for search engines and slow mobile connections.</li>
            <li><strong>Security:</strong> Keeps sensitive internal business logic, pricing calculation rules, and database credentials on the server.</li>
          </ul>
        </div>

        <div className="card arch-card">
          <div className="arch-badge client-badge">React Client Component ('use client')</div>
          <h3>2. Why Add to Cart Must Remain a Client Component</h3>
          <p>
            The <code>AddToCartButton</code> and cart state require client-side execution because they rely on browser events and active user state:
          </p>
          <ul className="arch-points">
            <li><strong>Event Handlers:</strong> Requires <code>onClick</code> listeners to react instantly to user clicks.</li>
            <li><strong>State &amp; Hooks:</strong> Utilizes <code>useOptimistic()</code>, <code>useTransition()</code>, and React Context.</li>
            <li><strong>Instant UI Feedback:</strong> Optimistically bumps the cart badge and displays loading spinners while awaiting server acknowledgement.</li>
            <li><strong>Browser Storage:</strong> May sync cart state with <code>localStorage</code> or indexedDB for offline persistence.</li>
          </ul>
        </div>
      </div>

      {/* How Server & Client Components Work Together */}
      <div className="card arch-integration-card">
        <h3>3. How Server and Client Components Work Together (Composition Pattern)</h3>
        <p>
          In a modern React 19 architecture (e.g. Next.js App Router or React Server Component bundler), Server and Client Components interleave seamlessly through <strong>composition</strong>:
        </p>

        <div className="code-block-preview">
          <pre>
{`// 🌐 ProductDetailsPage.server.jsx (Server Component)
import db from '@/lib/db';
import AddToCartButton from './AddToCartButton.client'; // Client Component Island
import SpecsList from './SpecsList.server';

export default async function ProductDetailsPage({ productId }) {
  // Direct DB query on server - zero client fetch!
  const product = await db.products.findUnique({ where: { id: productId } });

  return (
    <article className="product-layout">
      {/* Pre-rendered static HTML on the server */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <SpecsList specs={product.specs} />

      {/* Interactive Client Island receiving serializable server props */}
      <AddToCartButton product={product} />
    </article>
  );
}`}
          </pre>
        </div>
        <p className="integration-summary">
          <strong>Key Takeaway:</strong> The Server Component acts as the orchestrator and data-fetcher, and passes data as props down to small, focused interactive Client Component islands.
        </p>
      </div>

      {/* React Compiler Explanation */}
      <div className="card compiler-card">
        <div className="arch-badge compiler-badge">React Compiler (React Forget)</div>
        <h3>4. React Compiler: Automatic Memoization</h3>
        <p>
          The <strong>React Compiler</strong> is an optimizing compiler that deeply understands JavaScript semantics and the React Rules of Components.
        </p>

        <div className="compiler-features-grid">
          <div className="compiler-feature">
            <h4>What it Does</h4>
            <p>
              It automatically analyzes your component code and memoizes values, objects, callbacks, and JSX elements at build time.
            </p>
          </div>
          <div className="compiler-feature">
            <h4>How it Optimizes This App</h4>
            <p>
              Eliminates the mental overhead of manually writing <code>useMemo</code>, <code>useCallback</code>, and <code>React.memo</code> to prevent unnecessary re-renders.
            </p>
          </div>
        </div>

        <div className="compiler-example-box">
          <h4>Application Example:</h4>
          <p>
            In traditional React, calculating the cart total requires manual memoization to avoid recalculating on every re-render:
          </p>
          <pre>
{`// ❌ Traditional React: Manual useMemo required
const subtotal = useMemo(() => {
  return cart.reduce((sum, item) => sum + item.price, 0);
}, [cart]);

// ✅ With React Compiler:
// Just write idiomatic JavaScript! The compiler automatically inserts fine-grained memoization caches:
const subtotal = cart.reduce((sum, item) => sum + item.price, 0);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
