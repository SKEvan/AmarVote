'use client';

import { useEffect } from 'react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  message,
  type,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}: CustomModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={type === 'alert' ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in fade-in zoom-in duration-200">
        {/* Icon and Title */}
        <div className="flex flex-col items-center pt-8 px-6">
          <div className={`${getIconColor()} mb-4`}>
            {getIcon()}
          </div>
          
          {title && (
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
              {title}
            </h3>
          )}
        </div>

        {/* Message */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 text-center whitespace-pre-line leading-relaxed">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className={`flex gap-3 px-6 pb-6 ${type === 'confirm' ? 'flex-row-reverse' : ''}`}>
          {type === 'confirm' ? (
            <>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                {confirmText}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {cancelText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
