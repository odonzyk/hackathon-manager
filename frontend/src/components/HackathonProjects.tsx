import React, { useEffect, useState } from 'react';
import './HackathonProjects.css';

interface Project {
  id: number;
  name: string;
  description: string;
  team: string;
  contact: string;
  goal: string;
  components: string;
  skills: string;
}

const HackathonProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    fetch('/HackathonProjects.json')
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = [project.name, project.description, project.contact].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    );
    const matchesComponent =
      componentFilter === '' || project.components.toLowerCase().includes(componentFilter.toLowerCase());
    const matchesSkill =
      skillFilter === '' || project.skills.toLowerCase().includes(skillFilter.toLowerCase());
    return matchesSearch && matchesComponent && matchesSkill;
  });

  return (
    <div className="project-container">
      <h1 className="project-title">Hackathon Projekte 2024</h1>

      <div className="filter-container">
        <input
          type="text"
          placeholder="Suche nach Name, Beschreibung oder Ansprechpartner"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Filter nach Komponenten"
          value={componentFilter}
          onChange={(e) => setComponentFilter(e.target.value)}
          className="filter-input"
        />
        <input
          type="text"
          placeholder="Filter nach Skills"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="project-grid">
        {filteredProjects.map((project) => (
          <div key={project.id} className="project-card">
            <h2 className="project-name">{project.name}</h2>
            <p className="project-description">{project.description}</p>
            <div className="project-details">
              <p>
                <span role="img" aria-label="Team">👥</span> <strong>Team:</strong> {project.team}
              </p>
              <p>
                <span role="img" aria-label="Contact">📞</span> <strong>Kontakt:</strong> {project.contact}
              </p>
              <p>
                <span role="img" aria-label="Goal">🎯</span> <strong>Ziel:</strong> {project.goal}
              </p>
              <p>
                <span role="img" aria-label="Components">🛠️</span> <strong>Komponenten:</strong> {project.components}
              </p>
              <p>
                <span role="img" aria-label="Skills">💡</span> <strong>Skills:</strong> {project.skills}
              </p>
            </div>
            {/* Footer mit Button */}
            <div className="project-card-footer">
              <button className="project-action-button">Projekt beitreten</button>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
};

export default HackathonProjects;
