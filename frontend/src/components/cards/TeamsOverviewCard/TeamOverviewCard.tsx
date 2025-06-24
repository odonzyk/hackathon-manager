import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonText } from '@ionic/react';
import { Event, Project } from '../../../types/types';

interface TeamOverviewCardProps {
  projects: Project[];
  event: Event | null; // Optional event prop to filter projects
}

const TeamOverviewCard: React.FC<TeamOverviewCardProps> = ({ projects, event }) => {
  // Filtere Projekte des aktuellen Events
  const filteredProjects = projects.filter(
    (project) => project.event_id === event?.id && project.status_id <= 2,
  );

  // Berechne die Anzahl der registrierten Benutzer:innen
  const totalParticipants = filteredProjects.reduce(
    (sum, project) => sum + (project.participants?.length || 0) + (project.initiators?.length || 0),
    0,
  );

  // Berechne die Anzahl der Teams und deren angemeldete Teilnehmenden
  const totalTeams = filteredProjects.length;

  return (
    <IonCard
      className="hackathon-card"
      button
      onClick={() => {
        window.location.href = '/teams';
      }}
    >
      <IonCardHeader>
        <IonCardTitle>👥 Teilnehmende</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonText>
          {totalParticipants} Teilnehmende in {totalTeams} Teams
        </IonText>
      </IonCardContent>
    </IonCard>
  );
};

export default TeamOverviewCard;
