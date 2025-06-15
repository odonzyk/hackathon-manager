import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonFab,
  IonFabButton,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import { addOutline, folderOutline } from 'ionicons/icons';
import './ProjectListPage.css';
import { Event, Profile, Project } from '../../types/types';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { useHistory } from 'react-router-dom';
import ProjectListCard from '../../components/cards/ProjectListCard/ProjectListCard';
import { isDemo } from '../../utils/dataApiConnector';

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
    const matchesSearch = [
      project.idea,
      project.description,
      ...project.initiators.map((initiator) => initiator.name), 
      ...project.participants.map((participant) => participant.name),
    ].some((field) =>
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={folderOutline}/>
            Projekt Übersicht
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonGrid className='project-filter-grid'>
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonInput
                value={search}
                fill="outline"
                placeholder="Suche nach Name, Beschreibung oder Ansprechpartner"
                onIonInput={(e) => setSearch(e.detail.value!)}
                className="project-filter-input"
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonInput
                value={componentFilter}
                fill="outline"
                placeholder="Filter nach Komponenten"
                onIonInput={(e) => setComponentFilter(e.detail.value!)}
                className="project-filter-input"
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonInput
                value={skillFilter}
                fill='outline'
                placeholder="Filter nach Skills"
                onIonInput={(e) => setSkillFilter(e.detail.value!)}
                className="project-filter-input"
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Projekte */}
        <IonGrid className="hackathon-grid">
          <IonRow>
            {filteredProjects.map((project) => (
              <IonCol size="12" sizeMd="6" key={project.id}>
                <ProjectListCard
                  project={project}
                  onProjectClick={() => handleProjectClick(project.id)}
                />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* IonFab Button */}
        {!isDemo(profile) && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton color="primary" onClick={() => history.push('/projects/add')}>
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProjectListPage;
