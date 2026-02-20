import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '@/lib/useNotification';

interface NotificationBannerProps {
  notification: Notification | null;
  onDismiss: () => void;
  className?: string;
}

export default function NotificationBanner({ notification, onDismiss, className = '' }: NotificationBannerProps) {
  if (!notification) return null;

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'error':
        return 'bg-red-50 border-red-500 text-red-700';
      case 'success':
        return 'bg-green-50 border-green-500 text-green-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-700';
      case 'info':
        return 'bg-blue-50 border-blue-500 text-blue-700';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-700';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className={`p-4 rounded-xl border-l-4 flex items-center justify-between ${getNotificationStyles()} ${className}`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="font-medium">{notification.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}