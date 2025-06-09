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
import ProjectOverviewCard from '../../components/cards/ProjectOverviewCard/ProjectOverviewCard';
import TeamOverviewCard from '../../components/cards/TeamsOverviewCard/TeamOverviewCard';
import MyProjectOverviewCard from '../../components/cards/MyProjectOverviewCard/MyProjectOverviewCard';
import CountdownCard from '../../components/cards/CountdownCard/CountdownCard';
import { isDemo } from '../../utils/dataApiConnector';

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
        {isDemo(profile) && (
          <IonCard color={'secondary'}>
            <IonCardHeader>
              <IonCardTitle>Demo Mode</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              Bis zur vollständien Aktivierung ihres Accounts können Sie die Demo-Funktion nutzen.
            </IonCardContent>
          </IonCard>
        )}

        <CountdownCard event={event} />

        {/* Projekte und Teilnehmer Boxen */}
        <IonGrid className="hackathon-grid">
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <ProjectOverviewCard projects={projects} />
            </IonCol>
            <IonCol size="12" sizeMd="6">
              <TeamOverviewCard projects={projects} event={event} />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Aktuelles Projekt und Raumzuweisung */}
        <IonGrid className="hackathon-grid">
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <MyProjectOverviewCard profile={profile} event={event} />
            </IonCol>
            <IonCol size="12" sizeMd="6">
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
