import React from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import {
  homeOutline,
  calendarOutline,
  peopleOutline,
  folderOutline,
  personCircleOutline,
  idCardOutline,
} from 'ionicons/icons';
import './TabBar.css';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';

const TabBar: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    return null;
  }

  return (
    <IonTabBar id="AppTabBar" slot="bottom" className="custom-tab-bar">
      <IonTabButton tab="dashboard" href="/dashboard">
        <IonIcon icon={homeOutline} />
        <IonLabel>Dashboard</IonLabel>
      </IonTabButton>
      <IonTabButton tab="events" href="/events">
        <IonIcon icon={calendarOutline} />
        <IonLabel>Events</IonLabel>
      </IonTabButton>
      <IonTabButton tab="projects" href="/projects">
        <IonIcon icon={folderOutline} />
        <IonLabel>Projekte</IonLabel>
      </IonTabButton>
      <IonTabButton tab="teams" href="/teams">
        <IonIcon icon={idCardOutline} />
        <IonLabel>Teams</IonLabel>
      </IonTabButton>
      <IonTabButton tab="Teilnehmer" href="/userlist">
        <IonIcon icon={peopleOutline} />
        <IonLabel>Teilnehmer</IonLabel>
      </IonTabButton>
      <IonTabButton tab="Profil" href="/profil">
        <IonIcon icon={personCircleOutline} />
        <IonLabel>Profil</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default TabBar;
