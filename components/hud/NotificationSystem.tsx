'use client';

interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}

export default function NotificationSystem({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification notification-${notification.type}`}>
          <div className="notification-icon">
            {notification.type === 'success' && '✓'}
            {notification.type === 'error' && '✕'}
            {notification.type === 'info' && 'ℹ'}
            {notification.type === 'warning' && '!'}
          </div>
          <span className="notification-message">{notification.message}</span>
        </div>
      ))}
    </div>
  );
}
