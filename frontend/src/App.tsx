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
import { loadStoredProfile } from './utils/dataApiConnector';
import { Event, Profile, Project } from './types/types';
import { useToast } from './components/ToastProvider';
import { getExistingToken } from './utils/authUtils';
import { getPublicRoutes, getPrivateRoutes } from './utils/routes';
import Toolbar from './components/Toolbar.tsx/Toolbar';
import { fetchEvents, fetchProjects, fetchParticipateList } from './utils/dataFetchUtils';
import { requestTracking, trackingInit } from './utils/googleGA4';

setupIonicReact();
trackingInit;

const App = () => {
  const isAuthenticated = useIsAuthenticated();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { showToastError } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userListUpdated, setUserListUpdated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    requestTracking();
  }, [location]);

  useEffect(() => {
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
    if (profile) {
      const token = getExistingToken();
      if (!token) {
        showToastError('Token nicht gefunden. Bitte anmelden.');
        return;
      }
      fetchEvents(token, profile, setEvents, setSelectedEvent, showToastError);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      const token = getExistingToken();
      if (!token) {
        showToastError('Token nicht gefunden. Bitte anmelden.');
        return;
      }
      if (selectedEvent) {
        fetchProjects(selectedEvent.id, profile, token, setProjects, showToastError);
      }
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (userListUpdated) {
      setUserListUpdated(false); // Zurücksetzen, nachdem die Änderung verarbeitet wurde
    }
  }, [userListUpdated]);

  const updateProjects = (eventId: number, token: string) => {
    fetchProjects(eventId, profile, token, setProjects, showToastError);
  };
  const updateParticipateList = (token: string) => {
    fetchParticipateList(token, profile, setProfile, showToastError);
  };
  const updateSelectedEvent = (event: Event) => {
    setSelectedEvent(event); // Speichert das ausgewählte Event
  };
  const updateProfile = (updatedProfile: Profile) => {
    if (!updatedProfile || !updatedProfile.id) {
      showToastError('Ungültiges Profil. Bitte erneut anmelden.');
      return;
    }
    if (updatedProfile.id !== profile?.id) {
      console.log('Updating profile:', updatedProfile);
      setUserListUpdated(true);
    } else {
      setProfile(updatedProfile);
    }
  };

  const publicRoutes = getPublicRoutes();
  const privateRoutes = getPrivateRoutes(
    profile,
    events,
    selectedEvent,
    projects,
    userListUpdated,
    updateProjects,
    updateParticipateList,
    updateSelectedEvent,
    updateProfile,
  );

  const onSelectEvent = (selectedId: number) => {
    const event = events.find((ev) => ev.id === selectedId);
    setSelectedEvent(event || null);
  };

  return (
    <IonApp>
      <Menu />

      {/* Main Content */}
      <IonPage id="main-content">
        {/* Header */}
        <IonHeader className="main-header">
          <Toolbar selectedEvent={selectedEvent} events={events} onSelectEvent={onSelectEvent} />
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
