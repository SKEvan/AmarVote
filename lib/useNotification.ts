import { useState, useEffect } from 'react';

export type NotificationType = 'error' | 'success' | 'info' | 'warning';

export interface Notification {
  type: NotificationType;
  message: string;
  id?: string;
}

export function useNotification() {
  const [notification, setNotification] = useState<Notification | null>(null);

  // Auto-dismiss success, info, and warning notifications after 5 seconds
  useEffect(() => {
    if (notification && (notification.type === 'success' || notification.type === 'info' || notification.type === 'warning')) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message, id: Date.now().toString() });
  };

  const showError = (message: string) => showNotification('error', message);
  const showSuccess = (message: string) => showNotification('success', message);
  const showInfo = (message: string) => showNotification('info', message);
  const showWarning = (message: string) => showNotification('warning', message);

  const clearNotification = () => setNotification(null);

  return {
    notification,
    showNotification,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    clearNotification,
  };
}