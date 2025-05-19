import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { IonReactRouter } from '@ionic/react-router';
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';
import { ToastProvider } from './components/ToastProvider';


const store = createStore({
  authName: '_authParkApp',
  authType: 'cookie',
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === 'https:',
});

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <StrictMode>
    <AuthProvider store={store}>
      <ToastProvider>
        <IonReactRouter>
          <App />
        </IonReactRouter>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
