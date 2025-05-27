import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonFab,
  IonFabButton,
} from '@ionic/react';
import { Event, Profile, Project } from '../../types/types';
import './ProjectDetailPage.css';
import {
  bulbOutline,
  callOutline,
  constructOutline,
  flagOutline,
  peopleOutline,
  pencilOutline,
} from 'ionicons/icons';
import JoinProjectButton from '../../components/JoinProjectButton/JoinProjectButton';

interface ProjectDetailPageProps {
  profile: Profile | null;
  event: Event | null;
  projects: Project[];
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ profile, event, projects }) => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const project = projects.find((p) => p.id === parseInt(id));

  console.log('ProjectDetailPage: Project ID: ', id);
  console.log('ProjectDetailPage: Project: ', project);
  console.log('ProjectDetailPage: Projects: ', projects);

  useEffect(() => {
    console.log('ProjectDetailPage: useEffect: ', profile?.id, event?.id);
  }, []);

  const handleJoinProject = (id: number) => {
    console.log(`Projekt mit ID ${id} beitreten`);
    // Hier kannst du die Logik für das Beitreten eines Projekts implementieren
  };

  const handleEditProject = () => {
    history.push({
      pathname: '/projects/add',
      state: { project }, // Übergibt das bestehende Projekt zur Bearbeitung
    });
  };

  if (!project) {
    return (
      <IonPage>
        <IonContent>
          <p>Projekt nicht gefunden.</p>
        </IonContent>
      </IonPage>
    );
  }

  const isInitiator = project.initiators.some((initiator) => initiator.id === profile?.id);

  return (
    <IonPage>
      <IonContent>
        {isInitiator && (
          <IonFab vertical="top" horizontal="end" slot="fixed">
            <IonFabButton color="primary" onClick={handleEditProject}>
              <IonIcon icon={pencilOutline} />
            </IonFabButton>
          </IonFab>
        )}
        <IonCard className="hackathon-card project-detail-card">
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {project.idea}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText className="project-detail">{project.description}</IonText>

            <IonList>
              <IonItem>
                <IonIcon icon={peopleOutline} slot="start" style={{ color: '#007bff' }} />
                <IonLabel>
                  <h2>Team</h2>
                  <IonText>{project.team_name}</IonText>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={callOutline} slot="start" style={{ color: '#28a745' }} />
                <IonLabel>
                  <h2>Kontakt</h2>
                  <IonText>
                    {project.initiators.map((initiator) => (
                      <span key={initiator.id}>{initiator.name}<br /></span>
                    ))}
                  </IonText>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={flagOutline} slot="start" style={{ color: '#ffc107' }} />
                <IonLabel>
                  <h2>Ziel</h2>
                  <IonText>{project.goal}</IonText>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={constructOutline} slot="start" style={{ color: '#17a2b8' }} />
                <IonLabel>
                  <h2>Komponenten</h2>
                  <IonText>{project.components}</IonText>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={bulbOutline} slot="start" style={{ color: '#6f42c1' }} />
                <IonLabel>
                  <h2>Skills</h2>
                  <IonText>{project.skills}</IonText>
                </IonLabel>
              </IonItem>
            </IonList>

            <JoinProjectButton
              statusId={project.status_id}
              onJoinProject={() => handleJoinProject(project.id)}
            />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ProjectDetailPage;
