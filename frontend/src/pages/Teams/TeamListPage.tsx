import React, { useEffect } from 'react';
import { IonPage, IonContent, IonGrid, IonRow, IonCol } from '@ionic/react';
import './TeamListPage.css';
import { Event, Profile, Project } from '../../types/types';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import TeamCard from '../../components/cards/TeamCard/TeamCard';

interface TeamListPageProps {
  profile: Profile | null;
  projects: Project[];
  event: Event | null;
}

const TeamListPage: React.FC<TeamListPageProps> = ({ profile, event, projects }) => {
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    console.log('TeamListPage: useEffect: ', isAuthenticated, profile?.id, event?.id);
  }, []);

  return (
    <IonPage>
      <IonContent>
        <IonGrid className="hackathon-grid">
          <IonRow>
            {projects.map((project) => (
              <IonCol size="12" sizeMd="6" key={project.id}>
                <TeamCard project={project} />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default TeamListPage;
