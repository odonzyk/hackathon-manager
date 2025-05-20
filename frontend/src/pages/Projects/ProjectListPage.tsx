import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonButton,
} from '@ionic/react';
import './ProjectListPage.css';
import { Event, Profile, Project } from '../../types/types';
import { useToast } from '../../components/ToastProvider';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { getProjects, loadStoredProfile, ResultType } from '../../utils/globalDataUtils';
import { getExistingToken } from '../../utils/authUtils';

interface ProjectListPageProps {
  selectedEvent: Event | null;
}

const ProjectListPage: React.FC<ProjectListPageProps> = ({ selectedEvent }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const isAuthenticated = useIsAuthenticated();
  const { showToastError } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const fetchProjects = async (eventId: number | null, token: string | null) => {
    console.log('ProjectListPage: Fetching Projects');
    const result = await getProjects(eventId, token);
    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Error');
      return;
    }
    console.log('ProjectListPage: Projects fetched: ', result.data);
    setProjects(result.data);
  };

  useEffect(() => {
    console.log('ProjectListPage: useEffect: ', isAuthenticated, selectedEvent, profile?.id );
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
      if (selectedEvent) {
        fetchProjects(selectedEvent.id, token); 
      }
    }
    
  }, [profile, selectedEvent]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = [project.idea, project.description].some((field) =>
      field.toLowerCase().includes(search.toLowerCase()),
    );
    const matchesComponent =
      componentFilter === '' ||
      project.components.toLowerCase().includes(componentFilter.toLowerCase());
    const matchesSkill =
      skillFilter === '' || project.skills.toLowerCase().includes(skillFilter.toLowerCase());
    return matchesSearch && matchesComponent && matchesSkill;
  });

  return (
    <IonPage>
      <IonContent>
        <IonGrid className="filter-container">
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonInput
                placeholder="Suche nach Name, Beschreibung oder Ansprechpartner"
                value={search}
                onIonInput={(e) => setSearch(e.detail.value!)}
                className="filter-input"
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonInput
                placeholder="Filter nach Komponenten"
                value={componentFilter}
                onIonInput={(e) => setComponentFilter(e.detail.value!)}
                className="filter-input"
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonInput
                placeholder="Filter nach Skills"
                value={skillFilter}
                onIonInput={(e) => setSkillFilter(e.detail.value!)}
                className="filter-input"
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Projekte */}
        <IonGrid className="hackathon-grid">
          <IonRow>
            {filteredProjects.map((project) => (
              <IonCol size="12" sizeMd="6" key={project.id}>
                <IonCard className="hackathon-card">
                  <IonCardHeader>
                    <IonCardTitle>{project.idea}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>{project.description}</p>
                    <div className="project-details">
                      <p>
                        <span role="img" aria-label="Team">
                          👥
                        </span>{' '}
                        <strong>Team:</strong> {project.team_name}
                      </p>
                      <p>
                        <span role="img" aria-label="Contact">
                          📞
                        </span>{' '}
                        <strong>Kontakt:</strong> {project.initiator_id}
                      </p>
                      <p>
                        <span role="img" aria-label="Goal">
                          🎯
                        </span>{' '}
                        <strong>Ziel:</strong> {project.goal}
                      </p>
                      <p>
                        <span role="img" aria-label="Components">
                          🛠️
                        </span>{' '}
                        <strong>Komponenten:</strong> {project.components}
                      </p>
                      <p>
                        <span role="img" aria-label="Skills">
                          💡
                        </span>{' '}
                        <strong>Skills:</strong> {project.skills}
                      </p>
                    </div>
                    <IonButton expand="block">Projekt beitreten</IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ProjectListPage;
