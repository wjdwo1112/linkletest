import { useState } from 'react';

export function useAlert() {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '확인',
  });

  const showAlert = (message, title = '알림', confirmText = '확인') => {
    setAlertState({
      isOpen: true,
      title,
      message,
      confirmText,
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  return { alertState, showAlert, closeAlert };
}
