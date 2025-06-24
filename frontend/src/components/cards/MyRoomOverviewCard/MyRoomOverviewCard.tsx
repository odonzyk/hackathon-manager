import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonText } from '@ionic/react';
import { Event, Profile, Project } from '../../../types/types';
import { useHistory } from 'react-router-dom';
import './MyRoomOverviewCard.css';

interface MyRoomOverviewCardProps {
  profile: Profile | null;
  event: Event | null;
  projects: Project[];
}

const MyRoomOverviewCard: React.FC<MyRoomOverviewCardProps> = ({ profile, event, projects }) => {
  const history = useHistory();

  const participation = profile?.participate?.find(
    (participation) => participation.event_id === event?.id,
  );

  const projectDetails = projects.find((project) => project.id === participation?.project_id);

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
        <IonCardTitle>Dein Raum</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {projectDetails?.location || (
          <>
            <IonText className="myproject-text">Noch nicht bekannt</IonText>
          </>
        )}
      </IonCardContent>
    </IonCard>
  );
};

export default MyRoomOverviewCard;
