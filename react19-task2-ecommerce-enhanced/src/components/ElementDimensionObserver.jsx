import { useState } from 'react';

export default function ElementDimensionObserver({ targetProduct }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [cleanupLogs, setCleanupLogs] = useState([]);
  const [isObservedVisible, setIsObservedVisible] = useState(true);

  return (
    <div className="card ref-cleanup-demo-card">
      <div className="demo-header">
        <div>
          <h4>🔬 React 19 Feature: Callback-Ref Cleanup</h4>
          <p className="text-muted">
            Prior to React 19, callback refs could not return a cleanup function. In React 19, returning a function from a callback ref handles unmount cleanup automatically!
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setIsObservedVisible(!isObservedVisible)}
        >
          {isObservedVisible ? 'Unmount Observed Box' : 'Mount Observed Box'}
        </button>
      </div>

      {isObservedVisible ? (
        <div
          className="observed-box"
          // React 19 Callback Ref with Return Cleanup Function!
          ref={(node) => {
            if (!node) return;

            // 1. Setup ResizeObserver
            const observer = new ResizeObserver((entries) => {
              for (const entry of entries) {
                setDimensions({
                  width: Math.round(entry.contentRect.width),
                  height: Math.round(entry.contentRect.height)
                });
              }
            });

            observer.observe(node);

            // 2. Setup click listener as additional demonstration
            const handleClick = () => {
              alert(`Measured box: ${node.offsetWidth}px x ${node.offsetHeight}px`);
            };
            node.addEventListener('click', handleClick);

            // 3. REACT 19 NATIVE CLEANUP FUNCTION:
            // Returning a function here cleans up listeners/observers when node is detached!
            return () => {
              observer.disconnect();
              node.removeEventListener('click', handleClick);
              const logEntry = `[${new Date().toLocaleTimeString()}] Callback-ref cleanup executed: ResizeObserver & click listener disconnected.`;
              setCleanupLogs((prev) => [logEntry, ...prev.slice(0, 4)]);
            };
          }}
        >
          <div className="observed-badge">Live Measured Element</div>
          <div className="dimension-display">
            <span>Width: <strong>{dimensions.width}px</strong></span>
            <span>Height: <strong>{dimensions.height}px</strong></span>
          </div>
          <p className="observed-instruction">
            Resize your browser window or inspect this element to see the live dimensions update. Click "Unmount" above to trigger React 19's returned cleanup function!
          </p>
        </div>
      ) : (
        <div className="unmounted-notice">
          <span>Element unmounted. React 19 automatically executed the callback-ref cleanup function!</span>
        </div>
      )}

      {cleanupLogs.length > 0 && (
        <div className="cleanup-log-container">
          <span className="log-title">Recent Cleanup Executions:</span>
          <ul className="log-list">
            {cleanupLogs.map((log, index) => (
              <li key={index} className="log-item">{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
