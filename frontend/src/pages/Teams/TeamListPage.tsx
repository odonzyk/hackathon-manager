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
import './TeamListPage.css';
import { Project } from '../../types/types';
import TeamCard from '../../components/cards/TeamCard/TeamCard';
import { peopleOutline } from 'ionicons/icons';

interface TeamListPageProps {
  projects: Project[];
}

const TeamListPage: React.FC<TeamListPageProps> = ({ projects }) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={peopleOutline} />
            Team Übersicht
          </IonTitle>
        </IonToolbar>
      </IonHeader>

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
