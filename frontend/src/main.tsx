import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './msalConfig';

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);
