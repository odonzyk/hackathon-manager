import React, { useEffect } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

console.log('Home');


const Home: React.FC = () => {

  useEffect(() => {
    console.log('Home loaded');
  }, []);
  // useEffect(() => {

  return (
    <div className="home">
      <header className="home-header">
        <h1>🚀 Hackathon Manager</h1>
        <p>Verwalte deine Hackathon-Teams und -Projekte mühelos!</p>
      </header>
      <main className="home-main">
        <Link to="/teams" className="home-button">
          👥 Hackathon Teams
        </Link>
        <Link to="/projects" className="home-button">
          💡 Hackathon Projects
        </Link>
      </main>
    </div>
  );
};

export default Home;