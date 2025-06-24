import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/react';
import { Project } from '../../../types/types';

interface ProjectOverviewCardProps {
  projects: Project[];
}

const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({ projects }) => {
  // Filtere Projekte basierend auf ihrem Status
  const activeOrPitchProjects = projects.filter(
    (project) => project.status_id === 1 || project.status_id === 2,
  ).length;
  const cancelledProjects = projects.filter((project) => project.status_id === 4).length;

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
      <IonCardContent>
        {activeOrPitchProjects} Projekte aktiv
        <br />
        {cancelledProjects} Projekte abgebrochen
      </IonCardContent>
    </IonCard>
  );
};

export default ProjectOverviewCard;
