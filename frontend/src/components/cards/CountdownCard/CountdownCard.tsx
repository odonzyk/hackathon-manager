import React from 'react';
import { IonCardContent, IonCard, IonCardHeader, IonCardTitle } from '@ionic/react';
import { Event } from '../../../types/types';

import { formatCountdown} from '../../../utils/dateUtils';

interface CountdownCardProps {
    event: Event | null;
}

const CountdownCard: React.FC<CountdownCardProps> = ({ event }) => {
    return (
        <>
        { event?.start_time && event?.end_time ? (
            <IonCard className="hackathon-card no-hover ">
                {event.end_time < Math.floor(new Date().getTime() / 1000) ? (
                    <>
                        <IonCardHeader>
                            <IonCardTitle>Hackathon bereits vorbei</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            seit{' '}
                            {formatCountdown(-(event.start_time - Math.floor(new Date().getTime() / 1000)))}
                        </IonCardContent>
                    </>
                ) : (
                    <>
                        <IonCardHeader>
                            <IonCardTitle>Hackathon Countdown</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {formatCountdown(event.start_time - Math.floor(new Date().getTime() / 1000))}
                        </IonCardContent>
                    </>
                )}
            </IonCard>
        ) : null}
        </>
  );
};

export default CountdownCard;
