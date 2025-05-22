import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import './EventListPage.css';
import { Event, Profile } from '../../types/types';
import { useToast } from '../../components/ToastProvider';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { getEvents, ResultType } from '../../utils/globalDataUtils';
import { getExistingToken } from '../../utils/authUtils';
import { formatDate } from '../../utils/dateUtils';

interface EventListPageProps {
  profile: Profile | null;
}

const EventListPage: React.FC<EventListPageProps> = ({ profile }) => {
  const isAuthenticated = useIsAuthenticated();
  const { showToastError } = useToast();
  const [events, setEvents] = useState<Event[]>([]);

  // Funktion zum Abrufen der Aktivitäten
  const fetchEvents = async (token: string | null) => {
    console.log('EventListPage: Fetching Events');
    const result = await getEvents(token);
    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Error');
      return;
    }
    console.log('EventListPage: Events fetched: ', result.data);
    setEvents(result.data);
  };

  useEffect(() => {
    console.log('EventListPage: useEffect: ', isAuthenticated, profile);
    if (profile) {
      const token = getExistingToken();
      if (!token) {
        showToastError('Token nicht gefunden. Bitte anmelden.');
        return;
      }
      fetchEvents(token);
    }
  }, [profile]);

  return (
    <IonPage>
      <IonContent>
        <IonGrid className="hackathon-grid">
          <IonRow>
            {events.map((event) => (
              <IonCol size="12" sizeMd="6" key={event.id}>
                <IonCard className="hackathon-card">
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
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default EventListPage;
