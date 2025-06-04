import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/react';
import { Project } from '../../../types/types';

interface ProjectOverviewCardProps {
  projects: Project[];
}

const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({ projects }) => {
  return (
    <IonCard
      className="hackathon-card"
      button
      onClick={() => {
        window.location.href = '/projects';
      }}
    >
      <IonCardHeader>
        <IonCardTitle>📁 Projekte</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>{projects.length} eingereicht</IonCardContent>
    </IonCard>
  );
};

export default ProjectOverviewCard;
