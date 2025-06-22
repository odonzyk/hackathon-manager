import React from 'react';
import {
  IonCardContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { Project } from '../../../types/types';
import './TeamCard.css';
import { peopleCircleOutline, personOutline } from 'ionicons/icons';

interface TeamCardProps {
  project: Project;
}

const TeamCard: React.FC<TeamCardProps> = ({ project }) => {
  const teamName = project ? project.team_name : 'Noch kein Teamname';

  return (
    <IonCard className="hackathon-card team-card no-hover">
      <IonCardHeader>
        <IonCardTitle>{teamName}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          {project.initiators.map((initiator) => (
            <IonItem key={`initiator-${initiator.id}`}>
              <IonIcon icon={personOutline} slot="start" color="primary" />
              <IonLabel>{initiator.name}</IonLabel>
            </IonItem>
          ))}
          {project.participants?.map((participant) => (
            <IonItem key={`participant-${participant.id}`}>
              <IonIcon icon={peopleCircleOutline} slot="start" color="quaternary" />
              <IonLabel>{participant.name}</IonLabel>
            </IonItem>
          ))}
        </IonList>
        <p className="team-description">
          Mitglieder: (
          {project.initiators.length + (project.participants ? project.participants.length : 0)})
        </p>
      </IonCardContent>
    </IonCard>
  );
};

export default TeamCard;
