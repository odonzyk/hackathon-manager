import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { IonReactRouter } from '@ionic/react-router';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Das Root-Element wurde nicht gefunden. Stelle sicher, dass ein <div id='root'> im HTML vorhanden ist.");
}
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <IonReactRouter>
      <App />
    </IonReactRouter>
  </StrictMode>
);
