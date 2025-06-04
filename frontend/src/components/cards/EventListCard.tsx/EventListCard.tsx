import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/react';
import { Event } from '../../../types/types';
import './EventListCard.css';
import { formatDate } from '../../../utils/dateUtils';

interface EventListCardProps {
  event: Event;
}

const EventListCard: React.FC<EventListCardProps> = ({ event }) => {
  return (
    <IonCard className="hackathon-card event-card">
      <IonCardHeader>
        <IonCardTitle>{event.name}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div className="project-details">
          <p>
            <span role="img" aria-label="Start Time">
              🕒
            </span>{' '}
            <strong>Start Time:</strong> {formatDate(event.start_time)}
          </p>
          <p>
            <span role="img" aria-label="End Time">
              🕒
            </span>{' '}
            <strong>End Time:</strong> {formatDate(event.end_time)}
          </p>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default EventListCard;
