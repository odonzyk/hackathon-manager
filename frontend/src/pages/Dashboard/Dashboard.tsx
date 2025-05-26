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
import './Dashboard.css';
import { useEffect } from 'react';
import { Event, Profile, Project } from '../../types/types';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { formatCountdown } from '../../utils/dateUtils';

interface DashboardPageProps {
  profile: Profile | null;
  event: Event | null;
  projects: Project[];
}

const DashboardPage: React.FC<DashboardPageProps> = ({ profile, event, projects }) => {
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    console.log('DashboardPage: useEffect: ', isAuthenticated, profile?.id, event?.id);
  }, []);

  return (
    <IonPage>
      <IonContent>
        {/* Countdown Box */}
        {event?.start_time && event?.end_time ? (
          <IonCard className="hackathon-card">
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

        {/* Event Box */}

        {/* Projekte und Teilnehmer Boxen */}
        <IonGrid className="hackathon-grid">
          <IonRow>
            <IonCol>
              <IonCard className="hackathon-card">
                <IonCardHeader>
                  <IonCardTitle>📁 Projekte</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>{projects.length} eingereicht</IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol>
              <IonCard className="hackathon-card">
                <IonCardHeader>
                  <IonCardTitle>👥 Teilnehmer</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>{event?.id === 1 ? '85' : '0'} angemeldet</IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Aktuelles Projekt und Raumzuweisung */}
        <IonGrid className="hackathon-grid">
          <IonRow>
            <IonCol>
              <IonCard className="hackathon-card">
                <IonCardHeader>
                  <IonCardTitle>Dein aktuelles Projekt</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>🤖 SmartCart AI</IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol>
              <IonCard className="hackathon-card">
                <IonCardHeader>
                  <IonCardTitle>Raum</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>Raum A203</IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default DashboardPage;
