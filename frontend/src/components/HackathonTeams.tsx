import React, { useEffect, useState } from 'react';
import './HackathonTeams.css';

interface Team {
  id: number;
  project_id: number;
  members: string[];
}

interface Project {
  id: number;
  team: string;
}

const HackathonTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Lade die Teams-Daten
    fetch('/HackathonTeams.json')
      .then((res) => res.json())
      .then((data) => setTeams(data));

    // Lade die Projekte-Daten
    fetch('/HackathonProjects.json')
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  return (
    <div className="hackathon-teams">
      <h1 className="team-title">Hackathon Teams</h1>
      <div className="team-grid">
        {teams.map((team) => {
          // Finde den Teamnamen aus den Projektdaten basierend auf der project_id
          const project = projects.find((project) => project.id === team.project_id);
          const teamName = project ? project.team : 'Noch kein Teamname';

          return (
            <div key={team.id} className="team-card">
              <h2 className="team-name">{teamName}</h2>
              <p className="team-description">Mitglieder:</p>
              <ul className="team-details">
                {team.members.map((member, index) => (
                  <li key={index}>
                    <span role="img" aria-label="Person">👤</span> {member}
                  </li>
                ))}
              </ul>
              <p className="team-description">
                Mitglieder ({team.members.length}):
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HackathonTeams;