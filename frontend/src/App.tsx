import {
  IonApp,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonRouterOutlet,
  IonSelect,
  IonSelectOption,
  IonTabs,
  IonTitle,
  IonToolbar,
  setupIonicReact,
} from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import ReactGA from 'react-ga4';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './App.css';
import './theme/variables.css';
import ThaliaLogo from './assets/thalia_logo.png';
import { useState } from 'react';

import Menu from './components/Menu/Menu';
import PrivateRoute from './components/PrivateRoute';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import TabBar from './components/TabBar/TabBar';

import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPage from './pages/Dashboard/Dashboard';
import ProjectListPage from './pages/Projects/HackathonProjects';
import HackathonTeams from './pages/Teams/HackathonTeams';

setupIonicReact();
ReactGA.initialize('G-3LWGMR7G0P');

const App = () => {
  const isAuthenticated = useIsAuthenticated();
  const [selectedEvent, setSelectedEvent] = useState<string>('Hackathon 2025');

  const events = ['Hackathon 2024', 'Hackathon 2025', 'Hackathon 2026'];

  const publicRoutes = [
    { path: '/login', component: LoginPage, exact: true },
    { path: '/register', component: RegisterPage, exact: true },
  ];

  const privateRoutes = [
    { path: '/dashboard', component: DashboardPage, exact: true },
    { path: '/teams', component: HackathonTeams, exact: true },
    { path: '/projects', component: ProjectListPage, exact: true },
  ];

  return (
    <IonApp>
      <Menu />

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
              <IonTitle>Innovation Days</IonTitle>
            </div>
            <IonSelect
              value={selectedEvent}
              placeholder="Event auswählen"
              onIonChange={(e) => setSelectedEvent(e.detail.value)}
              interface="popover"
              slot="end"
            >
              {events.map((event, index) => (
                <IonSelectOption key={index} value={event}>
                  {event}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonToolbar>
        </IonHeader>

        {/* Content */}
        <IonContent className="hackathon-content">
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
              {publicRoutes.map((props) => (
                <Route key={props.path} {...props} />
              ))}
              {privateRoutes.map((props) => (
                <PrivateRoute key={props.path} isLoggedIn={isAuthenticated} {...props} />
              ))}
            </IonRouterOutlet>

            <TabBar />
          </IonTabs>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default App;
