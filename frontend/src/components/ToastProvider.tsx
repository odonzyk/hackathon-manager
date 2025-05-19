// src/components/ToastProvider.tsx
import React, { createContext, useContext, useState } from 'react';
import { IonToast } from '@ionic/react';
import { alertOutline, chatbubbleEllipsesOutline } from 'ionicons/icons';

interface ToastContextProps {
  showToastMessage: (msg: string) => void;
  showToastError: (msg: string) => void;
}

const ToastContext = createContext<ToastContextProps>({
  showToastMessage: () => {},
  showToastError: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const showToastError = (msg: string) => {
    console.error(msg);
    setToastMessage(msg);
    setShowAlert(true);
  };

  return (
    <ToastContext.Provider value={{ showToastMessage, showToastError }}>
      {children}
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        icon={chatbubbleEllipsesOutline}
        duration={2000}
        position="bottom"
        positionAnchor="AppTabBar"
        onDidDismiss={() => setShowToast(false)}
        cssClass="custom-toast"
      />
      <IonToast
        isOpen={showAlert}
        message={toastMessage}
        icon={alertOutline}
        duration={2000}
        position="bottom"
        positionAnchor="AppTabBar"
        onDidDismiss={() => setShowAlert(false)}
        cssClass="custom-toast-error"
      />
    </ToastContext.Provider>
  );
};
