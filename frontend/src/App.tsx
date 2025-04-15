import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './msalConfig';
import Home from './components/Home';
import HackathonTeams from './components/HackathonTeams';
import HackathonProjects from './components/HackathonProjects';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams" element={<HackathonTeams />} />
          <Route path="/projects" element={<HackathonProjects />} />
        </Routes>
      </BrowserRouter>
    </MsalProvider>
  );
}

export default App;