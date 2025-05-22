import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonText } from '@ionic/react';
import { Event, Profile, Project } from '../../types/types';
import './ProjectDetailPage.css';
import { bulbOutline, callOutline, constructOutline, flagOutline, peopleOutline } from 'ionicons/icons';

interface ProjectDetailPageProps {
   profile: Profile | null;
   event: Event | null;
   projects: Project[];  
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ profile, event, projects }) => {
    const { id } = useParams<{ id: string }>();
    const project = projects.find((p) => p.id === parseInt(id));

    console.log('ProjectDetailPage: Project ID: ', id);
    console.log('ProjectDetailPage: Project: ', project);
    console.log('ProjectDetailPage: Projects: ', projects);

    useEffect(() => {
        console.log('ProjectDetailPage: useEffect: ', profile?.id, event?.id );
    }, []);

    if (!project) {
        return (
            <IonPage>
                <IonContent>
                    <p>Projekt nicht gefunden.</p>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent>
                <IonCard className="hackathon-card project-detail-card">
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{project.idea}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                      <IonText className='project-detail'>{project.description}</IonText>

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

                    <div style={{ marginTop: '1.5rem' }}>
                      {project.status_id < 3 ? (
                        <IonButton expand="block" color="primary">Projekt beitreten</IonButton>
                      ) : null}
                      {project.status_id === 3 ? (
                        <IonButton expand="block" disabled={true} color="secondary">Projekt abgeschlossen</IonButton>
                      ) : null}
                      {project.status_id === 4 ? (
                        <IonButton expand="block" disabled={true} color="danger">Projekt abgebrochen</IonButton>
                      ) : null}
                    </div>
                  </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default ProjectDetailPage;