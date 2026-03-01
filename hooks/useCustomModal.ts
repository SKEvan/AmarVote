import { useState } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
}

export function useCustomModal() {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  const showAlert = (
    message: string, 
    variant: 'success' | 'error' | 'warning' | 'info' = 'info',
    title?: string
  ) => {
    setModalState({
      isOpen: true,
      title: title || (variant === 'success' ? 'Success' : variant === 'error' ? 'Error' : 'Notice'),
      message,
      variant
    });
  };

  const closeModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  return {
    isOpen: modalState.isOpen,
    title: modalState.title,
    message: modalState.message,
    variant: modalState.variant,
    showAlert,
    closeModal
  };
}
