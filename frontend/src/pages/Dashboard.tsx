import React from 'react';
import './Dashboard.css';
import ThaliaLogo from '../assets/thalia_logo.png'; // Pfad zum Logo-Bild

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo">
          <img src={ThaliaLogo} alt="Thalia Logo" className="logo-image" />
          <span>Thalia</span>
        </div>
        <h1>Hackathon</h1>
      </header>

      <main className="dashboard-main">
        {/* Countdown Box */}
        <div className="hackaton-card">
          <h2>Hackathon Countdown</h2>
          <p>56 Tage 12 Stunden 44 Minuten</p>
        </div>

        {/* Projekte und Teilnehmer Boxen */}
        <div className="info-grid">
          <div className="hackaton-card">
            <h2>📁 Projekte</h2>
            <p>21 eingereicht</p>
          </div>
          <div className="hackaton-card">
            <h2>👥 Teilnehmer</h2>
            <p>85 angemeldet</p>
          </div>
        </div>

        {/* Aktuelles Projekt und Raumzuweisung */}
        <div className="project-room-grid">
          <div className="hackaton-card">
            <h2>Dein aktuelles Projekt</h2>
            <p>
              <span>🤖 SmartCart AI</span>
            </p>
          </div>
          <div className="hackaton-card">
            <h2>Raum</h2>
            <p>Raum A203</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;