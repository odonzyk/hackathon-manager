import React from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { homeOutline, calendarOutline, peopleOutline } from 'ionicons/icons';
import './TabBar.css';

const TabBar: React.FC = () => {
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
        <IonIcon icon={calendarOutline} />
        <IonLabel>Projekte</IonLabel>
      </IonTabButton>
      <IonTabButton tab="teams" href="/teams">
        <IonIcon icon={peopleOutline} />
        <IonLabel>Teams</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default TabBar;
