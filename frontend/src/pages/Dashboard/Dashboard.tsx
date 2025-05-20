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
import { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import { Event, Profile, Project } from '../../types/types';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { useToast } from '../../components/ToastProvider';
import { getEvent, getEvents, getProjects, loadStoredProfile, ResultType } from '../../utils/globalDataUtils';
import { getExistingToken } from '../../utils/authUtils';
import { formatCountdown } from '../../utils/dateUtils';
import CountdownFlip from '../../components/flipNumbers';
import FlipNumbers from 'react-flip-numbers';

interface DashboardPageProps {
  selectedEvent: Event | null;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ selectedEvent } ) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const isAuthenticated = useIsAuthenticated();
  const { showToastError } = useToast();
  const [event, setEvent] = useState<Event|null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

// Funktion zum Abrufen der Aktivitäten
  const fetchEvent = async (id: number, token: string | null) => {
    console.log('DashboardPage: Fetching Event');
    const result = await getEvent(id, token);
    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Error');
      return;
    }
    console.log('DashboardPage: Events fetched: ', result.data);
    setEvent(result.data);
  };

    const fetchProjects = async (eventId: number | null, token: string | null) => {
      console.log('ProjectListPage: Fetching Projects');
      const result = await getProjects(eventId, token);
      if (result.resultType !== ResultType.SUCCESS || result.data === null) {
        showToastError(result.resultMsg ?? 'Error');
        return;
      }
      console.log('ProjectListPage: Projects fetched: ', result.data);
      setProjects(result.data);
    };

  useEffect(() => {
    console.log('DashboardPage: useEffect: ', isAuthenticated, selectedEvent, profile?.id);
    if (!isAuthenticated) return;

    if (!profile) {
      const userProfile = loadStoredProfile();
      if (!userProfile || !userProfile.id) {
        showToastError('Profil nicht gefunden. Bitte anmelden.');
        return;
      }
      setProfile(userProfile);
    }

    if (profile) {
      const token = getExistingToken();
      if (!token) {
        showToastError('Token nicht gefunden. Bitte anmelden.');
        return;
      }
      if (selectedEvent) {
        fetchEvent(selectedEvent.id, token); 
        fetchProjects(selectedEvent.id, token); 
      }
    }
  }, [profile, selectedEvent]);

  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
  }, []);

  return (
    <IonPage>
      <IonContent>
        {/* Countdown Box */}
        {event?.start_time && event?.end_time ? (
        <IonCard className="hackathon-card">
          {event.end_time  < Math.floor((new Date()).getTime() / 1000) ? (
            <>
              <IonCardHeader>
                <IonCardTitle>
                  Hackerton bereits vorbei
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                seit {formatCountdown(-(event.start_time - Math.floor((new Date()).getTime() / 1000)))}
              </IonCardContent>
            </>
          ) : (
            <>
              <IonCardHeader>
                <IonCardTitle>
                  Hackerton Countdown
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {formatCountdown(event.start_time - Math.floor((new Date()).getTime() / 1000))}                
              </IonCardContent>
            </>
          )}
        </IonCard>
        ) : null }

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
