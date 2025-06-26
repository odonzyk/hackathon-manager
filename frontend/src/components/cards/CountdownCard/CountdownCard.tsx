import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/react';
import { Event } from '../../../types/types';

import { formatCountdown } from '../../../utils/dateUtils';

interface CountdownCardProps {
  event: Event | null;
}

const EventState = {
  upcoming: 1,
  ongoing: 2,
  ended: 3,
};

const CountdownCard: React.FC<CountdownCardProps> = ({ event }) => {
  console.log('Start Time, End Time:', event?.start_time, event?.end_time);

  if (!event || !event.start_time || !event.end_time) {
    console.warn('Event data is not available or incomplete:', event);
    return null; // Return null if event data is not available
  }
  let eventState = EventState.ended;
  const currentTime = Math.floor(new Date().getTime() / 1000);
  if (event?.start_time <= currentTime && event?.end_time > currentTime) {
    eventState = EventState.ongoing;
  } else if (event?.start_time > currentTime) {
    eventState = EventState.upcoming;
  } else {
    eventState = EventState.ended;
  }
  console.log('Event State:', eventState);

  return (
    <>
      {eventState === EventState.ended && (
        <IonCard className="hackathon-card no-hover">
          <IonCardHeader>
            <IonCardTitle>Hackathon bereits vorbei</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>seit {formatCountdown(currentTime - event.end_time)}</IonCardContent>
        </IonCard>
      )}

      {eventState === EventState.upcoming && (
        <IonCard className="hackathon-card no-hover">
          <IonCardHeader>
            <IonCardTitle>Hackathon Countdown</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>{formatCountdown(event.start_time - currentTime)}</IonCardContent>
        </IonCard>
      )}

      {eventState === EventState.ongoing && (
        <IonCard className="hackathon-card no-hover">
          <IonCardHeader>
            <IonCardTitle>Hackathon läuft, bis zur Demo noch</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>{formatCountdown(event.end_time - currentTime)}</IonCardContent>
        </IonCard>
      )}
    </>
  );
};

export default CountdownCard;
