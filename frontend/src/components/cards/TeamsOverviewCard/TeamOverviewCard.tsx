import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/react';
import { Event, Project } from '../../../types/types';

interface TeamOverviewCardProps {
  projects: Project[];
  event: Event | null; // Optional event prop to filter projects
}

const TeamOverviewCard: React.FC<TeamOverviewCardProps> = ({ projects, event }) => {
  return (
    <IonCard
      className="hackathon-card"
      button
      onClick={() => {
        window.location.href = '/teams';
      }}
    >
      <IonCardHeader>
        <IonCardTitle>👥 Teilnehmer</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {projects
          .filter((project) => project.event_id === event?.id) // Filtere Projekte des aktuellen Events
          .reduce(
            (sum, project) =>
              sum + (project.participants?.length || 0) + (project.initiators?.length || 0),
            0,
          )}{' '}
        angemeldet
      </IonCardContent>
    </IonCard>
  );
};

export default TeamOverviewCard;
