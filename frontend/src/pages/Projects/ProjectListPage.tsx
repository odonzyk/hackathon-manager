import React, { useState } from 'react';
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
  IonButtons,
  IonButton,
} from '@ionic/react';
import { addOutline, clipboardOutline, folderOutline } from 'ionicons/icons';
import './ProjectListPage.css';
import { Profile, Project } from '../../types/types';
import { useHistory } from 'react-router-dom';
import ProjectListCard from '../../components/cards/ProjectListCard/ProjectListCard';
import { isDemo, isOrganisator } from '../../utils/dataApiConnector';
import { useToast } from '../../components/ToastProvider';

interface ProjectListPageProps {
  profile: Profile | null;
  projects: Project[];
}

const ProjectListPage: React.FC<ProjectListPageProps> = ({ profile, projects }) => {
  const [search, setSearch] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const { showToastMessage, showToastError } = useToast();
  const history = useHistory();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = [
      project.idea,
      project.description,
      ...project.initiators.map((initiator) => initiator.name),
      ...project.participants.map((participant) => participant.name),
    ].some((field) => field.toLowerCase().includes(search.toLowerCase()));

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

  const handleCopyEmailsToClipboard = () => {
    if (!profile || !isOrganisator(profile)) {
      console.warn('Nur Organisatoren können E-Mail-Adressen kopieren.');
      return;
    }
    if (!projects || projects.length === 0) return;
    let csv = 'event_id,project_id,project_idea,type,name,mail\n';
    projects.forEach((project) => {
      project.initiators.forEach((initiator) => {
        if (initiator.email) {
          csv += `${project.id},${project.idea},initiator,${initiator.name},${initiator.email}\n`;
        }
      });
      project.participants.forEach((participant) => {
        if (participant.email) {
          csv += `${project.id},${project.idea},participant,${participant.name},${participant.email}\n`;
        }
      });
    });
    console.log('E-Mail-Adressen CSV:', csv);
    navigator.clipboard
      .writeText(csv)
      .then(() => {
        showToastMessage('CSV wurde erfolgreich in die Zwischenablage kopiert!');
      })
      .catch(() => {
        showToastError('Fehler beim Kopieren Daten.');
      });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={folderOutline} />
            Projekt Übersicht
          </IonTitle>
          <IonButtons slot="end">
            {isOrganisator(profile) && (
              <IonButton onClick={handleCopyEmailsToClipboard} title="E-Mail-Adressen kopieren">
                <IonIcon icon={clipboardOutline} slot="icon-only" />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonGrid className="project-filter-grid">
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonInput
                value={search}
                fill="outline"
                placeholder="Suche nach Name, Beschreibung oder Ansprechpartner"
                onIonInput={(e) => setSearch(e.detail.value!)}
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonInput
                value={componentFilter}
                fill="outline"
                placeholder="Filter nach Komponenten"
                onIonInput={(e) => setComponentFilter(e.detail.value!)}
              />
            </IonCol>
            <IonCol size="12" sizeMd="4">
              <IonInput
                value={skillFilter}
                fill="outline"
                placeholder="Filter nach Skills"
                onIonInput={(e) => setSkillFilter(e.detail.value!)}
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
                  profile={profile}
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
