import React, { useState } from 'react';
import './Login.css';

const Login: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);

  const handleLogin = () => {
        setUserData({
          name: "Test User",
          username: "testuser",
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