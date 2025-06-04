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
import ProjectOverviewCard from '../../components/cards/ProjectOverviewCard/ProjectOverviewCard';
import TeamOverviewCard from '../../components/cards/TeamsOverviewCard/TeamOverviewCard';
import MyProjectOverviewCard from '../../components/cards/MyProjectOverviewCard/MyProjectOverviewCard';

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

        {/* Event Box */}

        {/* Projekte und Teilnehmer Boxen */}
        <IonGrid className="hackathon-grid">
          <IonRow>
            <IonCol>
              <ProjectOverviewCard projects={projects} />
            </IonCol>
            <IonCol>
              <TeamOverviewCard projects={projects} event={event} />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Aktuelles Projekt und Raumzuweisung */}
        <IonGrid className="hackathon-grid">
          <IonRow>
            <IonCol>
              <MyProjectOverviewCard profile={profile} event={event} />
            </IonCol>
            <IonCol>
              <IonCard className="hackathon-card no-hover">
                <IonCardHeader>
                  <IonCardTitle>Raum</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>Noch nicht bekannt</IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default DashboardPage;
