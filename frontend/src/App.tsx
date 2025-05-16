import {
  IonApp,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';

import HackathonTeams from './pages/Teams/HackathonTeams';
import HackathonProjects from './pages/Projects/HackathonProjects';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import { menuController } from '@ionic/core/components';
import './App.css';
import './theme/variables.css';
import ThaliaLogo from './assets/thalia_logo.png';

setupIonicReact();

function App() {
  return (
    <IonApp>
      <IonMenu className="hackathon-menu" contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menü</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem routerLink="/" onClick={() => menuController.close()}>
              🏠 Startseite
            </IonItem>
            <IonItem routerLink="/projects" onClick={() => menuController.close()}>
              📁 Projekte
            </IonItem>
            <IonItem routerLink="/teams" onClick={() => menuController.close()}>
              👥 Teams
            </IonItem>
            <IonItem routerLink="/login" onClick={() => menuController.close()}>
              🔑 Login
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>

      {/* Main Content */}
      <IonPage id="main-content">
        {/* Header */}
        <IonHeader>
          <IonToolbar className="hackathon-toolbar">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <div className="logo">
              <img src={ThaliaLogo} alt="Thalia Logo" className="logo-image" />
              <IonTitle>Thalia Hackathon</IonTitle>
            </div>
          </IonToolbar>
        </IonHeader>

        {/* Content */}
        <IonContent className="hackathon-content">
          <IonRouterOutlet>
            <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/teams" component={HackathonTeams} />
            <Route exact path="/projects" component={HackathonProjects} />
          </IonRouterOutlet>
        </IonContent>
      </IonPage>
    </IonApp>
  );
}

export default App;
