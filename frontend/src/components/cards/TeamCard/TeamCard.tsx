import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/react';
import { Project } from '../../../types/types';
import './TeamCard.css';

interface TeamCardProps {
  project: Project;
}

const TeamCard: React.FC<TeamCardProps> = ({ project }) => {
  const teamName = project ? project.team_name : 'Noch kein Teamname';

  return (
    <IonCard className="hackathon-card team-card">
      <IonCardHeader>
        <IonCardTitle>{teamName}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p className="team-description">Initiatoren:</p>
        <ul className="team-details">
          {project.initiators.map((member, index) => (
            <li key={index}>
              <span role="img" aria-label="Person">
                👤
              </span>{' '}
              {member.name}
            </li>
          ))}
        </ul>
        <br />
        <p className="team-description">Teilnehmer:</p>
        <ul className="team-details">
          {project.participants.map((member, index) => (
            <li key={index}>
              <span role="img" aria-label="Person">
                👤
              </span>{' '}
              {member.name}
            </li>
          ))}
        </ul>
        <br />
        <p className="team-description">
          Mitglieder: (
          {project.initiators.length + (project.participants ? project.participants.length : 0)})
        </p>
      </IonCardContent>
    </IonCard>
  );
};

export default TeamCard;
