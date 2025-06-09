import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonCard,
  IonBadge,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonCardContent,
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import './UserList.css';
import { getAllUsers, getProjects, ResultType } from '../../utils/dataApiConnector';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { useToast } from '../../components/ToastProvider';
import { Event, Profile, Project } from '../../types/types';
import { getExistingToken } from '../../utils/authUtils';

interface UserListPageProps {
  profile: Profile | null;
  events: Event[];
}

const UserListPage: React.FC<UserListPageProps> = ({ profile, events }) => {
  const isAuthenticated = useIsAuthenticated();
  const { showToastError } = useToast();
  const [userlist, setUserlist] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Funktion zum Abrufen der Benutzerliste
  const fetchUserList = async (token: string | null) => {
    console.log('UserListPage: Fetching Users');
    const result = await getAllUsers(profile, token);
    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Error');
      return;
    }
    console.log('UserListPage: Users fetched: ', result.data);
    setUserlist(result.data);
    setFilteredUsers(result.data);
  };

  const fetchProjectList = async (token: string | null) => {
    console.log('UserListPage: Fetching Projects for all Events');
    const aggregatedProjects: Project[] = [];

    for (const event of events) {
      const result = await getProjects(event.id, profile, token);
      if (result.resultType !== ResultType.SUCCESS || result.data === null) {
        showToastError(result.resultMsg ?? 'Error');
        continue;
      }
      console.log(`UserListPage: Projects fetched for event ${event.id}:`, result.data);
      aggregatedProjects.push(...result.data);
    }
    setProjects(aggregatedProjects);
  };

  useEffect(() => {
    console.log('UserListPage: useEffect: ', isAuthenticated, profile);
    if (profile) {
      const token = getExistingToken();
      if (!token) {
        showToastError('Token nicht gefunden. Bitte anmelden.');
        return;
      }
      fetchUserList(token);
      fetchProjectList(token);
    }
  }, [profile]);

  // Filterfunktion für die Suche
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterUsers(term, selectedEvent);
  };

  // Filterfunktion für Events
  const handleEventFilter = (eventId: number | null) => {
    const event = events.find((ev) => ev.id === eventId) || null;
    setSelectedEvent(event);
    filterUsers(searchTerm, event);
  };

  // Kombinierte Filterfunktion
  const filterUsers = (term: string, event: Event | null) => {
    let filtered = userlist;

    // Filter nach Suchbegriff
    if (term) {
      filtered = filtered.filter((user) => user.name.toLowerCase().includes(term.toLowerCase()));
    }

    // Filter nach Event
    if (event) {
      filtered = filtered.filter((user) =>
        projects.some(
          (project) =>
            (project.initiators.some((initiator) => initiator.id === user.id) ||
              project.participants.some((p) => p.id === user.id)) &&
            project.event_id === event.id,
        ),
      );
    }

    setFilteredUsers(filtered);
  };

  // Gruppierung der Benutzer nach Anfangsbuchstaben
  const groupedUsers = filteredUsers.reduce((acc: Record<string, Profile[]>, user) => {
    const firstLetter = user.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(user);
    return acc;
  }, {});

  console.log('UserListPage: projects: ', projects);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Teilnehmer Liste</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="8">
              {/* Suchfeld */}
              <IonInput
                value={searchTerm}
                fill="outline"
                placeholder="Benutzer suchen..."
                onIonChange={(e) => handleSearch(e.detail.value!)}
                className="search-input"
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              {/* Event-Filter */}
              <IonSelect
                interface="popover" /* Popover wird verwendet */
                fill="outline"
                value={selectedEvent?.id || null}
                placeholder="Event auswählen"
                onIonChange={(e) => handleEventFilter(e.detail.value)}
                className="event-select"
              >
                <IonSelectOption value={null}>Alle Events</IonSelectOption>
                {events.map((event) => (
                  <IonSelectOption key={event.id} value={event.id}>
                    {event.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Alphabetische Navigation */}
        <IonGrid className="alphabet-navigation">
          <IonRow>
            {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
              <IonCol key={letter} size="auto">
                <IonButton
                  size="small"
                  color="#17a2b8"
                  onClick={() => {
                    const element = document.getElementById(`section-${letter}`);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {letter}
                </IonButton>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* Benutzerliste nach Buchstaben */}
        {Object.keys(groupedUsers)
          .sort()
          .map((letter) => (
            <div key={letter} id={`section-${letter}`} className="user-section">
              <IonText className="user-section-title">{letter}</IonText>
              <IonGrid>
                <IonRow>
                  {groupedUsers[letter].map((user) => {
                    const initiatorCount = projects.filter((project) =>
                      project.initiators.some((initiator) => initiator.id === user.id),
                    ).length;
                    const participantCount = projects.filter((project) =>
                      project.participants.some((p) => p.id === user.id),
                    ).length;

                    return (
                      <IonCol size="12" sizeMd="3" key={user.id}>
                        <IonCard className="user-card">
                          <IonCardContent>
                            <IonText className="user-section-detail">{user.name}</IonText>
                            <div>
                              <div className="tooltip-container">
                                <IonBadge color="secondary">{initiatorCount}</IonBadge>
                                <div className="tooltip">Initiator</div>
                              </div>
                              <div className="tooltip-container">
                                <IonBadge color="primary">{participantCount}</IonBadge>
                                <div className="tooltip">Teilnehmer</div>
                              </div>
                            </div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    );
                  })}
                </IonRow>
              </IonGrid>
            </div>
          ))}
      </IonContent>
    </IonPage>
  );
};

export default UserListPage;
