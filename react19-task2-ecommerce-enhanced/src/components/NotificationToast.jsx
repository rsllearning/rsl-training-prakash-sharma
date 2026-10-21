import { useCart } from '../context/CartContext';

export default function NotificationToast() {
  const { notification, clearNotification } = useCart();

  if (!notification) return null;

  return (
    <div className={`toast-container toast-${notification.type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {notification.type === 'success' ? '✅' : '❌'}
        </span>
        <span className="toast-message">{notification.text}</span>
      </div>
      <button className="toast-close" onClick={clearNotification}>&times;</button>
    </div>
  );
}
