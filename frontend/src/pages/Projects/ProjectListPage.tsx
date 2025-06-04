import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import './ProjectListPage.css';
import { Event, Profile, Project } from '../../types/types';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { useHistory } from 'react-router-dom';
import ProjectListCard from '../../components/cards/ProjectListCard/ProjectListCard';

interface ProjectListPageProps {
  profile: Profile | null;
  projects: Project[];
  event: Event | null;
}

const ProjectListPage: React.FC<ProjectListPageProps> = ({ profile, event, projects }) => {
  const isAuthenticated = useIsAuthenticated();
  const [search, setSearch] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const history = useHistory();

  useEffect(() => {
    console.log('ProjectListPage: useEffect: ', isAuthenticated, profile?.id, event?.id);
  }, []);

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

  const handleProjectClick = (id: number) => {
    history.push(`/projectdetail/${id}`);
  };

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
                  <ProjectListCard project={project} onProjectClick={() => handleProjectClick(project.id)} />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* IonFab Button */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary" onClick={() => history.push('/projects/add')}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default ProjectListPage;
