import React from 'react';
import { IonCardContent, IonText, IonList, IonItem, IonIcon, IonLabel } from '@ionic/react';
import { callOutline, flagOutline, peopleCircleOutline } from 'ionicons/icons';
import { Project } from '../../types/types';
import './ProjectListCard.css';

interface ProjectListCardProps {
  project: Project;
}

const ProjectListCard: React.FC<ProjectListCardProps> = ({ project }) => {
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
        <IonItem>
          <IonIcon icon={peopleCircleOutline} slot="start" style={{ color: '#17a2b8' }} />
          <IonLabel>
            <h2>Teilnehmer</h2>
            <IonText>
              {project.participants.length + project.initiators.length} (von max. 12)
            </IonText>
          </IonLabel>
        </IonItem>
      </IonList>
    </IonCardContent>
  );
};

export default ProjectListCard;
