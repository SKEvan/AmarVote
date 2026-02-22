import { useState } from 'react';

interface ModalConfig {
  title?: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ModalConfig>({
    message: '',
    variant: 'info'
  });
  const [type, setType] = useState<'alert' | 'confirm'>('alert');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  const showAlert = (message: string, variant: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    setConfig({ message, variant, title });
    setType('alert');
    setIsOpen(true);
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    options?: {
      variant?: 'success' | 'error' | 'warning' | 'info';
      title?: string;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    setConfig({
      message,
      variant: options?.variant || 'warning',
      title: options?.title,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText
    });
    setType('confirm');
    setConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setConfirmCallback(null);
  };

  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback();
    }
  };

  return {
    isOpen,
    config,
    type,
    showAlert,
    showConfirm,
    handleClose,
    handleConfirm
  };
}
