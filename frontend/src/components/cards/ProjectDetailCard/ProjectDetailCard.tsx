import React from 'react';
import { IonCardContent, IonText, IonList, IonItem, IonIcon, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonFab, IonFabButton } from '@ionic/react';
import { bulbOutline, callOutline, constructOutline, flagOutline, pencilOutline, peopleOutline } from 'ionicons/icons';
import { Profile, Project } from '../../../types/types';
import './ProjectDetailCard.css';

interface ProjectDetailCardProps {
  project: Project;
  profile: Profile | null;
  onEditClick: () => void;
}

const ProjectDetailCard: React.FC<ProjectDetailCardProps> = ({ project, profile, onEditClick }) => {

  const isInitiator = project.initiators.some((initiator) => initiator.id === profile?.id);
  const isParticipant = project.participants?.some((p) => p.id === profile?.id);

  return (
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
            <IonFabButton color="primary" onClick={onEditClick}>
              <IonIcon icon={pencilOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default ProjectDetailCard;
