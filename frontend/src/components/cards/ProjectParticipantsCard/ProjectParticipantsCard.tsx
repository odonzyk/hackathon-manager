import React from 'react';
import './ProjectParticipantsCard.css';
import { Profile, Project, RoleTypes } from '../../../types/types';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
} from '@ionic/react';
import { peopleCircleOutline, personOutline, trashOutline } from 'ionicons/icons';
import JoinProjectButton from '../../buttons/JoinProjectButton/JoinProjectButton';

interface ProjectParticipantsCardProps {
  project: Project;
  profile: Profile | null;
  onJoinClick: () => void;
  onRecjectClick: () => void;
  isLoading?: boolean;
  onRemoveParticipant: (user_id: number, project_id: number) => void;
  onRemoveInitiator: (user_id: number, project_id: number) => void;
}

const ProjectParticipantsCard: React.FC<ProjectParticipantsCardProps> = ({
  project,
  profile,
  onJoinClick,
  onRecjectClick,
  isLoading,
  onRemoveParticipant,
  onRemoveInitiator,
}) => {
  if (!project || !profile) {
    return null;
  }

  const countTeamMembers = project.participants.length + project.initiators.length;

  // Überprüfen, ob der Benutzer Manager oder Admin ist
  const isManagerOrAdmin =
    profile.role_id === RoleTypes.MANAGER || profile.role_id === RoleTypes.ADMIN;

  return (
    <IonCard className="hackathon-card participant-card">
      <IonCardHeader>
        <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Teilnehmer</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          {project.initiators.map((initiator) => (
            <IonItem key={`initiator-${initiator.id}`}>
              <IonIcon icon={personOutline} slot="start" style={{ color: '#007bff' }} />
              <IonLabel>{initiator.name}</IonLabel>
              {isManagerOrAdmin && (
                <IonButton
                  slot="end"
                  color="danger"
                  onClick={() => onRemoveInitiator(initiator.user_id, project.id)} // Verwende die Prop
                  className="round-button"
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              )}
            </IonItem>
          ))}
          {project.participants?.map((participant) => (
            <IonItem key={`participant-${participant.id}`}>
              <IonIcon icon={peopleCircleOutline} slot="start" style={{ color: '#17a2b8' }} />
              <IonLabel>{participant.name}</IonLabel>
              {isManagerOrAdmin && (
                <IonButton
                  slot="end"
                  color="danger"
                  onClick={() => onRemoveParticipant(participant.user_id, project.id)} // Verwende die Prop
                  className="round-button"
                >
                  <IonIcon icon={trashOutline} />
                </IonButton>
              )}
            </IonItem>
          ))}
          <IonItem>
            <IonLabel>
              <IonText>
                {countTeamMembers} (von max. {project.max_team_size})
              </IonText>
            </IonLabel>
          </IonItem>
        </IonList>
        <div className="join-project-button-container">
          <JoinProjectButton
            project={project}
            profile={profile!}
            onRejectProject={onRecjectClick}
            onJoinProject={onJoinClick}
            disabled={isLoading}
          />
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default ProjectParticipantsCard;
