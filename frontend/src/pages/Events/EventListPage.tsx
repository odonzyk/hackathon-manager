import React from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
} from '@ionic/react';
import './EventListPage.css';
import { Event } from '../../types/types';
import EventListCard from '../../components/cards/EventListCard.tsx/EventListCard';
import { calendarOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

interface EventListPageProps {
  events: Event[];
  onEventSelect: (event: Event) => void; // Funktion zum Setzen des Events
}

const EventListPage: React.FC<EventListPageProps> = ({ events, onEventSelect }) => {
  const history = useHistory();

  const handleEventClick = (event: Event) => {
    onEventSelect(event); // Setzt das ausgewählte Event
    history.push('/projects'); // Navigiert zur Projektliste
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={calendarOutline} />
            Event Liste
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonGrid className="hackathon-grid">
          <IonRow>
            {events.map((event) => (
              <IonCol size="12" sizeMd="6" key={event.id}>
                <EventListCard event={event} onEventClick={() => handleEventClick(event)} />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default EventListPage;
