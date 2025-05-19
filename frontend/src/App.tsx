import {
  IonApp,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from '@ionic/react';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { menuController } from '@ionic/core/components';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './App.css';
import './theme/variables.css';
import ThaliaLogo from './assets/thalia_logo.png';

import HackathonTeams from './pages/Teams/HackathonTeams';
import HackathonProjects from './pages/Projects/HackathonProjects';
import LoginPage from './pages/Login/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { homeOutline, folderOutline, peopleOutline, logInOutline, logOutOutline } from 'ionicons/icons';
import { cleanUpStorage } from './utils/authUtils';
import useSignOut from 'react-auth-kit/hooks/useSignOut';

setupIonicReact();

const App = () => {
  const isAuthenticated = useIsAuthenticated();
  const history = useHistory();
  const signOut = useSignOut();

  const handleLogout = () => {
    if (!isAuthenticated) return;

    cleanUpStorage();
    signOut();
    setTimeout(() => {
      document.location.href = '/login';
    }, 0);
  };

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
            <IonItem button routerLink="/" disabled={!isAuthenticated} onClick={() => menuController.close()}>
              <IonIcon slot="start" icon={homeOutline} />
              Startseite
            </IonItem>
            <IonItem routerLink="/projects" disabled={!isAuthenticated} onClick={() => menuController.close()}>
              <IonIcon slot="start" icon={folderOutline} />
              Projekte
            </IonItem>
            <IonItem routerLink="/teams" disabled={!isAuthenticated} onClick={() => menuController.close()}>
              <IonIcon slot="start" icon={peopleOutline} />
              Teams
            </IonItem>
            <IonItem
              button
              onClick={() => {
                if (isAuthenticated) {
                  handleLogout();
                  menuController.close();
                } else {
                  history.push('/login');
                  menuController.close();
                }
              }}
              >
              <IonIcon icon={isAuthenticated ? logOutOutline : logInOutline} slot="start" />
              <IonLabel>{isAuthenticated ? "Logout" : "Login"}</IonLabel>
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
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/teams" component={HackathonTeams} />
            <Route exact path="/projects" component={HackathonProjects} />
          </IonRouterOutlet>
        </IonContent>
      </IonPage>
    </IonApp>
  );
}

export default App;
