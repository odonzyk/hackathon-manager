import React from 'react';
import {
  IonCardContent,
  IonText,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
} from '@ionic/react';
import { callOutline, flagOutline } from 'ionicons/icons';
import { Project } from '../../types/types';
import JoinProjectButton from '../JoinProjectButton/JoinProjectButton';

interface ProjectListCardProps {
  project: Project;
  onJoinProject: (id: number) => void;
}

const ProjectListCard: React.FC<ProjectListCardProps> = ({ project, onJoinProject }) => {
  return (
    <IonCardContent>
      <IonText className="project-detail">{project.description}</IonText>

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
            <IonText>{project.goal}</IonText>
          </IonLabel>
        </IonItem>
      </IonList>

      <JoinProjectButton
        statusId={project.status_id}
        onJoinProject={() => onJoinProject(project.id)}
      />
    </IonCardContent>
  );
};

export default ProjectListCard;