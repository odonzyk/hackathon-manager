import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonText } from '@ionic/react';
import { Event, Profile } from '../../../types/types';
import { useHistory } from 'react-router-dom';
import './MyProjectOverviewCard.css';

interface MyProjectOverviewCardProps {
  profile: Profile | null;
  event: Event | null;
}

const MyProjectOverviewCard: React.FC<MyProjectOverviewCardProps> = ({ profile, event }) => {
  const history = useHistory();

  const participation = profile?.participate?.find(
    (participation) => participation.event_id === event?.id,
  );

  const handleCardClick = () => {
    if (participation) {
      history.push(`/projectdetail/${participation.project_id}`);
    } else {
      history.push('/projects');
    }
  };

  return (
    <IonCard className="hackathon-card dashboard" button onClick={handleCardClick}>
      <IonCardHeader>
        <IonCardTitle>Dein aktuelles Projekt</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {participation?.idea || (
          <>
            <IonText className="myproject-text">Kein Projekt ausgewählt.</IonText>
            <br />
            <IonText className="myproject-hint">
              Entdecke die aktuellen Projekte oder werde selbst aktiv und reiche dein eigenes ein!
            </IonText>
          </>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default MyProjectOverviewCard;
