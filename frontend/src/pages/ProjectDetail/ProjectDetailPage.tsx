import React, { useEffect, useState } from 'react';
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
  IonGrid,
  IonRow,
  IonCol,
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
  personOutline,
  peopleCircleOutline,
} from 'ionicons/icons';
import JoinProjectButton from '../../components/JoinProjectButton/JoinProjectButton';
import { getExistingToken } from '../../utils/authUtils';
import { deleteParticipant, postParticipant, ResultType } from '../../utils/globalDataUtils';
import { useToast } from '../../components/ToastProvider';

interface ProjectDetailPageProps {
  profile: Profile | null;
  event: Event | null;
  projects: Project[];
  onParticipantChange: () => void;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  profile,
  event,
  projects,
  onParticipantChange,
}) => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  const { showToastMessage, showToastError } = useToast();

  const project = projects.find((p) => p.id === parseInt(id));

  const handleJoinProject = async (project_id: number, user_id: number) => {
    console.log(`Projekt mit ID ${project_id} beitreten`);
    setLoading(true);
    const token = getExistingToken();
    const result = await postParticipant(project_id, user_id, token);

    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Fehler beim Speichern des Projekts');
    } else {
      showToastMessage('Projekt erfolgreich beigetreten!');
    }
    onParticipantChange();
    setLoading(false);
  };

  const handleRejectProject = async (project_id: number, user_id: number) => {
    console.log(`Projekt mit ID ${project_id} ablehnen`);
    setLoading(true);
    const token = getExistingToken();
    const result = await deleteParticipant(project_id, user_id, token);

    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Fehler beim Löschen der Teilnahme');
    } else {
      showToastMessage('Teilnahme erfolgreich zurückgezogen!');
    }
    onParticipantChange();
    setLoading(false);
  };

  const handleEditProject = () => {
    history.push({
      pathname: '/projects/add',
      state: { project },
    });
  };

  useEffect(() => {
    console.log('ProjectDetailPage: useEffect: ', profile?.id, event?.id);
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

  const isInitiator = project.initiators.some((initiator) => initiator.id === profile?.id);
  const isParticipant = project.participants?.some((p) => p.id === profile?.id);

  return (
    <IonPage>
      <IonContent>
        <IonGrid>
          <IonRow>
            {/* Projekt Details */}
            <IonCol size="12" sizeLg="8">
              <IonCard className="hackathon-card project-detail-card">
                <div className="project-badge-container">
                  {isInitiator && <div className="project-badge initiator-badge">Initiator</div>}
                  {!isInitiator && isParticipant && (
                    <div className="project-badge participant-badge">Teilnehmer</div>
                  )}
                </div>
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
                            <span key={initiator.id}>
                              {initiator.name}
                              <br />
                            </span>
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
                  {isInitiator && (
                    <IonFab
                      vertical="bottom"
                      horizontal="end"
                      slot="fixed"
                      className="fab-inside-card"
                    >
                      <IonFabButton color="primary" onClick={handleEditProject}>
                        <IonIcon icon={pencilOutline} />
                      </IonFabButton>
                    </IonFab>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Teilnehmer Liste */}
            <IonCol size="12" sizeLg="4">
              <IonCard className="hackathon-card participant-card">
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Teilnehmer
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    {project.initiators.map((initiator) => (
                      <IonItem key={`initiator-${initiator.id}`}>
                        <IonIcon icon={personOutline} slot="start" style={{ color: '#007bff' }} />
                        <IonLabel>{initiator.name}</IonLabel>
                      </IonItem>
                    ))}
                    {project.participants?.map((participant) => (
                      <IonItem key={`participant-${participant.id}`}>
                        <IonIcon
                          icon={peopleCircleOutline}
                          slot="start"
                          style={{ color: '#17a2b8' }}
                        />
                        <IonLabel>{participant.name}</IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                  <div className="join-project-button-container">
                    <JoinProjectButton
                      project={project}
                      profile={profile!}
                      onRejectProject={() => handleRejectProject(project.id, profile!.id)}
                      onJoinProject={() => handleJoinProject(project.id, profile!.id)}
                      disabled={loading}
                    />
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ProjectDetailPage;
