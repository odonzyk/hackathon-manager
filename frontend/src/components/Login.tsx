import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import './Login.css';

const Login: React.FC = () => {
  const { instance, accounts } = useMsal();
  const [userData, setUserData] = useState<any>(null);

  const handleLogin = () => {
    instance
      .loginPopup({
        scopes: ['user.read'], // Erforderliche Berechtigungen
      })
      .then((response) => {
        console.log('Login erfolgreich:', response);
        console.log('MSAL-Accounts:', accounts);

        // Benutzerinformationen aus dem Access Token abrufen
        const account = response.account;
        setUserData({
          name: account?.name,
          username: account?.username,
          tenantId: account?.tenantId,
        });
      })
      .catch((error) => {
        console.error('Login fehlgeschlagen:', error);
      });
  };

  return (
    <div className="login">
      <div className="login-container">
        <h1>Willkommen beim Hackathon Manager</h1>
        <p>Bitte melde dich an, um fortzufahren!</p>
        {!userData ? (
          <button onClick={handleLogin} className="login-button">
            Mit Microsoft anmelden
          </button>
        ) : (
          <div className="user-info">
            <h2>Hallo, {userData.name}!</h2>
            <p>Benutzername: {userData.username}</p>
            <p>Tenant ID: {userData.tenantId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;