import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
} from '@ionic/react';
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
    <IonPage>
      <IonContent>
        <IonGrid className="filter-container">
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonInput
                placeholder="Suche nach Name, Beschreibung oder Ansprechpartner"
                value={search}
                onIonInput={(e) => setSearch(e.detail.value!)}
                className="filter-input"
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonInput
                placeholder="Filter nach Komponenten"
                value={componentFilter}
                onIonInput={(e) => setComponentFilter(e.detail.value!)}
                className="filter-input"
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonInput
                placeholder="Filter nach Skills"
                value={skillFilter}
                onIonInput={(e) => setSkillFilter(e.detail.value!)}
                className="filter-input"
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Projekte */}
        <IonGrid className="hackathon-grid">
          <IonRow>
            {filteredProjects.map((project) => (
              <IonCol size="12" sizeMd="6" key={project.id}>
                <IonCard className="hackathon-card">
                  <IonCardHeader>
                    <IonCardTitle>{project.name}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
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
                    <IonButton expand="block" color="primary" className="project-action-button">
                      Projekt beitreten
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        </IonContent>
    </IonPage>
  );
};

export default HackathonProjects;
