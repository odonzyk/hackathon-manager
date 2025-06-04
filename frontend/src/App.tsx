import {
  IonApp,
  IonContent,
  IonHeader,
  IonPage,
  IonRouterOutlet,
  IonTabs,
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
import { useEffect, useState } from 'react';

import Menu from './components/Menu/Menu';
import PrivateRoute from './components/PrivateRoute';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import TabBar from './components/TabBar/TabBar';

import {
  getEvents,
  getProjects,
  getUserParticipations,
  loadStoredProfile,
  ResultType,
} from './utils/globalDataUtils';
import { Event, Profile, Project } from './types/types';
import { useToast } from './components/ToastProvider';
import { getExistingToken } from './utils/authUtils';
import { getPublicRoutes, getPrivateRoutes } from './utils/routes';
import Toolbar from './components/Toolbar.tsx/Toolbar';

setupIonicReact();
ReactGA.initialize('***REMOVED***');

const App = () => {
  const isAuthenticated = useIsAuthenticated();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { showToastError } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const location = useLocation();

  // Funktion zum Abrufen der Aktivitäten
  const fetchEvents = async (token: string | null) => {
    console.log('App: Fetching Events');
    const result = await getEvents(token);
    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Error');
      return;
    }
    console.log(`App: ${result.data.length} Events fetched ! `);
    setEvents(result.data);
    //setSelectedEvent(result.data[result.data.length - 1]);
    setSelectedEvent(result.data[1]);
  };

  const fetchProjects = async (eventId: number | null, token: string | null) => {
    console.log('App: Fetching Projects');
    const result = await getProjects(eventId, token);
    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Error');
      return;
    }
    console.log(`App: ${result.data.length} Projects fetched ! `);
    setProjects(result.data);
  };

  const fetchParticipateList = async (user_id: number, token: string | null) => {
    console.log('App: Fetching Participate List');
    if (!profile) {
      showToastError('Profile not loaded');
      return;
    }
    const result = await getUserParticipations(user_id, token);
    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Error');
      return;
    }
    console.log(`App: ${result.data.length} Participations fetched ! `);
    profile.participate = result.data;
    setProfile(profile);
  };

  const getPageTitle = (pathname: string): string => {
    const pageTitles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/events': 'Events',
      '/teams': 'Teams',
      '/projects': 'Projects',
      '/projectdetail': 'ProjectDetail',
      '/login': 'Login',
      '/register': 'Register',
    };

    // Dynamische Routen abfangen
    if (pathname.startsWith('/projectdetail')) {
      return pageTitles['/projectdetail'];
    }

    return pageTitles[pathname] || pathname;
  };

  useEffect(() => {
    const domain = window.location.hostname;
    const pageTitle = getPageTitle(location.pathname);
    console.log('Tracking pageview:', domain, location.pathname, pageTitle);
    if (domain === 'localhost') {
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname,
        hostname: domain,
        title: pageTitle,
      });
    }
  }, [location]);

  useEffect(() => {
    console.log('App: useEffect: ', isAuthenticated, profile);
    if (!isAuthenticated) return;

    if (!profile) {
      const userProfile = loadStoredProfile();
      if (!userProfile || !userProfile.id) {
        showToastError('Profil nicht gefunden. Bitte anmelden.');
        return;
      }
      setProfile(userProfile);
    }
  }, []);

  useEffect(() => {
    console.log('App: useEffect: ', isAuthenticated, profile);

    if (profile) {
      const token = getExistingToken();
      if (!token) {
        showToastError('Token nicht gefunden. Bitte anmelden.');
        return;
      }
      fetchEvents(token);
    }
  }, [profile]);

  useEffect(() => {
    console.log('App: useEffect: ', isAuthenticated, selectedEvent, profile?.id);

    if (profile) {
      const token = getExistingToken();
      if (!token) {
        showToastError('Token nicht gefunden. Bitte anmelden.');
        return;
      }
      if (selectedEvent) {
        fetchProjects(selectedEvent.id, token);
      }
    }
  }, [selectedEvent]);

  const publicRoutes = getPublicRoutes();
  const privateRoutes = getPrivateRoutes(
    profile,
    selectedEvent,
    projects,
    fetchProjects,
    fetchParticipateList,
  );

const onSelectEvent = (selectedId : number) => {
  console.log('App: onSelectEvent: ', selectedId);
  const event = events.find((ev) => ev.id === selectedId);
  setSelectedEvent(event || null);
}

  return (
    <IonApp>
      <Menu />

      {/* Main Content */}
      <IonPage id="main-content">
        {/* Header */}
        <IonHeader>
          <Toolbar 
            selectedEvent={selectedEvent}
            events={events}
            onSelectEvent={onSelectEvent} 
          />
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
