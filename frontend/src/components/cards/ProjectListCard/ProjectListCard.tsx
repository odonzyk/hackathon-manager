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
} from '@ionic/react';
import { callOutline, flagOutline, peopleCircleOutline } from 'ionicons/icons';
import { Profile, Project, ProjectStatus } from '../../../types/types';
import './ProjectListCard.css';

interface ProjectListCardProps {
  project: Project;
  profile: Profile | null;
  onProjectClick: () => void;
}

const ProjectListCard: React.FC<ProjectListCardProps> = ({ project, profile,onProjectClick }) => {
  if (!project) {
    return null;
  }
  const countTeamMembers = project.participants.length + project.initiators.length;
  const isInitiator = project.initiators.some((initiator) => initiator.user_id === profile?.id);
  const isParticipant = project.participants?.some((p) => p.user_id === profile?.id);
  const isCanceled = project.status_id === ProjectStatus.CANCELD;
  const isClosed = project.status_id === ProjectStatus.ARCHIVED || project.status_id === ProjectStatus.ENDED;

  return (
    <IonCard className="hackathon-card" button onClick={onProjectClick}>
      <div className="project-badge-container">
        {isInitiator && <div className="project-badge initiator-badge">Initiator</div>}
        {isCanceled && <div className="project-badge closed-badge">Abgebrochen</div>}
        {isClosed && <div className="project-badge closed-badge">Geschlossen</div>} 
        {!isInitiator && isParticipant && (
          <div className="project-badge participant-badge">Teilnehmer</div>
        )}
      </div>
      <IonCardHeader>
        <IonCardTitle>{project.idea}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonText className="project-list-detail project-list-short">{project.description}</IonText>

        <IonList>
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
              <IonText className="project-list-short">{project.goal}</IonText>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon icon={peopleCircleOutline} slot="start" style={{ color: '#17a2b8' }} />
            <IonLabel>
              <h2>Teilnehmer</h2>
              <IonText>
                {countTeamMembers} (von max. {project.max_team_size})
              </IonText>
            </IonLabel>
          </IonItem>
        </IonList>
      </IonCardContent>
    </IonCard>
  );
};

export default ProjectListCard;
