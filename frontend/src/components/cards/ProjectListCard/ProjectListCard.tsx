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
import { Project } from '../../../types/types';
import './ProjectListCard.css';

interface ProjectListCardProps {
  project: Project;
  onProjectClick: () => void;
}

const ProjectListCard: React.FC<ProjectListCardProps> = ({ project, onProjectClick }) => {
  if (!project) {
    return null;
  }
  const countTeamMembers = project.participants.length + project.initiators.length;

  return (
    <IonCard className="hackathon-card" button onClick={onProjectClick}>
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
