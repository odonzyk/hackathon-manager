import React from 'react';
import {
  IonCardContent,
  IonText,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonFab,
  IonFabButton,
} from '@ionic/react';
import {
  bulbOutline,
  callOutline,
  constructOutline,
  flagOutline,
  locationOutline,
  pencilOutline,
  peopleCircleOutline,
  peopleOutline,
} from 'ionicons/icons';
import { Profile, Project } from '../../../types/types';
import './ProjectDetailCard.css';
import { isOrganisator } from '../../../utils/dataApiConnector';

interface ProjectDetailCardProps {
  project: Project;
  profile: Profile | null;
  onEditClick: () => void;
}

const ProjectDetailCard: React.FC<ProjectDetailCardProps> = ({ project, profile, onEditClick }) => {
  const isInitiator = project.initiators.some((initiator) => initiator.user_id === profile?.id);
  const isParticipant = project.participants?.some((p) => p.user_id === profile?.id);

  return (
    <IonCard className="hackathon-card no-hover">
      <div className="project-badge-container">
        {isInitiator && <div className="project-badge initiator-badge">Initiator</div>}
        {!isInitiator && isParticipant && (
          <div className="project-badge participant-badge">Teilnehmer</div>
        )}
      </div>
      <IonCardHeader>
        <IonCardTitle>{project.idea}</IonCardTitle>
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
              <h2>Ziel des Projekts</h2>
              <IonText>{project.goal}</IonText>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={constructOutline} slot="start" style={{ color: '#17a2b8' }} />
            <IonLabel>
              <h2>Benötigte Komponenten, Hardware, Materialien</h2>
              <IonText>{project.components}</IonText>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={bulbOutline} slot="start" style={{ color: '#6f42c1' }} />
            <IonLabel>
              <h2>Benötigte Fähigkeiten, Fachwissen, Know How, etc.</h2>
              <IonText>{project.skills}</IonText>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={locationOutline} slot="start" style={{ color: '#ff9800' }} />
            <IonLabel>
              <h2>Ort / Raum</h2>
              <IonText>{project.location}</IonText>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={peopleCircleOutline} slot="start" style={{ color: '#007bff' }} />
            <IonLabel>
              <h2>Maximale Teamgröße</h2>
              <IonText>{project.max_team_size}</IonText>
            </IonLabel>
          </IonItem>
        </IonList>
        {(isInitiator || isOrganisator(profile)) && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed" className="fab-inside-card">
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
