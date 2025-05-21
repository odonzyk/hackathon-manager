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
import { Redirect, Route, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './App.css';
import './theme/variables.css';
import ThaliaLogo from './assets/thalia_logo.png';
import { useEffect, useState } from 'react';

import Menu from './components/Menu/Menu';
import PrivateRoute from './components/PrivateRoute';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import TabBar from './components/TabBar/TabBar';

import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import DashboardPage from './pages/Dashboard/Dashboard';
import ProjectListPage from './pages/Projects/ProjectListPage';
import HackathonTeams from './pages/Teams/HackathonTeams';
import EventListPage from './pages/Events/EventListPage';
import { getEvents, loadStoredProfile, ResultType } from './utils/globalDataUtils';
import { Event, Profile } from './types/types';
import { useToast } from './components/ToastProvider';
import { getExistingToken } from './utils/authUtils';

setupIonicReact();
ReactGA.initialize('G-3LWGMR7G0P');

const App = () => {
  const isAuthenticated = useIsAuthenticated();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { showToastError } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const location = useLocation();

  // Funktion zum Abrufen der Aktivitäten
  const fetchEvents = async (token: string | null) => {
    console.log('EventListPage: Fetching Events');
    const result = await getEvents(token);
    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Error');
      return;
    }
    console.log('EventListPage: Events fetched: ', result.data);
    setEvents(result.data);
    //setSelectedEvent(result.data[result.data.length - 1]);
    setSelectedEvent(result.data[0]);
  };

  const getPageTitle = (pathname: string): string => {
    const pageTitles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/events': 'Events',
      '/teams': 'Teams',
      '/projects': 'Projects',
      '/login': 'Login',
      '/register': 'Register',
    };
    return pageTitles[pathname] || pathname;
  }


  useEffect(() => {
    const domain = window.location.hostname;
    const pageTitle = getPageTitle(location.pathname);
    console.log('Tracking pageview:', domain, location.pathname, pageTitle);
    if (domain === 'localhost') {
      ReactGA.send({ hitType: 'pageview', page: location.pathname, hostname: domain, title: pageTitle });
    }
  }, [location]);

  useEffect(() => {
    console.log('EventListPage: useEffect: ', isAuthenticated, profile);
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
      fetchEvents(token);
    }
  }, [profile]);

  const publicRoutes = [
    { path: '/login', component: LoginPage, exact: true },
    { path: '/register', component: RegisterPage, exact: true },
  ];

  const privateRoutes = [
    { path: '/dashboard', component: DashboardPage, exact: true, selectedEvent: selectedEvent },
    { path: '/events', component: EventListPage, exact: true },
    { path: '/teams', component: HackathonTeams, exact: true },
    { path: '/projects', component: ProjectListPage, exact: true, selectedEvent: selectedEvent },
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
              value={selectedEvent?.id}
              placeholder="Event auswählen"
              onIonChange={(e) => {
                const selectedId = e.detail.value;
                const event = events.find((ev) => ev.id === selectedId);
                setSelectedEvent(event || null);
              }}
              interface="popover"
              slot="end"
            >
              {events.map((event) => (
                <IonSelectOption key={event.id} value={event.id}>
                  {event.name}
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
