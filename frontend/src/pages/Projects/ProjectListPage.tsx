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
  IonText,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import './ProjectListPage.css';
import { Event, Profile, Project } from '../../types/types';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { useHistory } from 'react-router-dom';
import { callOutline, flagOutline, peopleOutline } from 'ionicons/icons';

interface ProjectListPageProps {
  profile: Profile | null;
  projects: Project[];
  event: Event | null;
}

const ProjectListPage: React.FC<ProjectListPageProps> = ({ profile, event, projects }) => {
  const isAuthenticated = useIsAuthenticated();
  const [search, setSearch] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const history = useHistory();



  useEffect(() => {
    console.log('ProjectListPage: useEffect: ', isAuthenticated, profile?.id, event?.id);
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = [project.idea, project.description].some((field) =>
      field.toLowerCase().includes(search.toLowerCase()),
    );
    const matchesComponent =
      componentFilter === '' ||
      project.components.toLowerCase().includes(componentFilter.toLowerCase());
    const matchesSkill =
      skillFilter === '' || project.skills.toLowerCase().includes(skillFilter.toLowerCase());
    return matchesSearch && matchesComponent && matchesSkill;
  });

  const handleProjectClick = (id: number) => {
    history.push(`/projectdetail/${id}`);
  };

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
                <IonCard
                  className="hackathon-card"
                  button
                  onClick={() => handleProjectClick(project.id)} // Navigation bei Klick
                >
                  <IonCardHeader>
                    <IonCardTitle>{project.idea}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText className='project-detail'>{project.description}</IonText>
                    
                                        <IonList>
                                          <IonItem>
                                            <IonIcon icon={callOutline} slot="start" style={{ color: '#28a745' }} />
                                            <IonLabel>
                                              <h2>Kontakt</h2>
                                              <IonText>{project.initiator_id}</IonText>
                                            </IonLabel>
                                          </IonItem>
                                          <IonItem>
                                            <IonIcon icon={flagOutline} slot="start" style={{ color: '#ffc107' }} />
                                            <IonLabel>
                                              <h2>Ziel</h2>
                                              <IonText>{project.goal}</IonText>
                                            </IonLabel>
                                          </IonItem>
                                        </IonList>
                    {project.status_id < 3 ? (
                      <IonButton expand="block">Projekt beitreten</IonButton>
                    ) : null}
                    {project.status_id === 3 ? (
                      <IonButton expand="block" disabled={true} color="secondary">Projekt abgeschlossen</IonButton>
                    ) : null}
                    {project.status_id === 4 ? (
                      <IonButton expand="block" disabled={true} color="danger">Projekt abgebrochen</IonButton>
                    ) : null}
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

export default ProjectListPage;
