import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { Event, Profile, Project } from '../../types/types';
import './ProjectDetailPage.css';
import { getExistingToken } from '../../utils/authUtils';
import { deleteParticipant, postParticipant, ResultType } from '../../utils/globalDataUtils';
import { useToast } from '../../components/ToastProvider';
import EmptyPage from '../../components/EmptyPage';
import ProjectDetailCard from '../../components/cards/ProjectDetailCard/ProjectDetailCard';
import ProjectParticipantsCard from '../../components/cards/ProjectParticipantsCard/ProjectParticipantsCard';

interface ProjectDetailPageProps {
  profile: Profile | null;
  event: Event | null;
  projects: Project[];
  onParticipantChange: () => void;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  profile,
  event,
  projects,
  onParticipantChange,
}) => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  const { showToastMessage, showToastError } = useToast();

  const project = projects.find((p) => p.id === parseInt(id));

  const handleJoinProject = async (project_id: number, user_id: number) => {
    console.log(`Projekt mit ID ${project_id} beitreten`);
    setLoading(true);
    const token = getExistingToken();
    const result = await postParticipant(project_id, user_id, token);

    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Fehler beim Speichern des Projekts');
    } else {
      showToastMessage('Projekt erfolgreich beigetreten!');
    }
    onParticipantChange();
    setLoading(false);
  };

  const handleRejectProject = async (project_id: number, user_id: number) => {
    console.log(`Projekt mit ID ${project_id} ablehnen`);
    setLoading(true);
    const token = getExistingToken();
    const result = await deleteParticipant(project_id, user_id, token);

    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Fehler beim Löschen der Teilnahme');
    } else {
      showToastMessage('Teilnahme erfolgreich zurückgezogen!');
    }
    onParticipantChange();
    setLoading(false);
  };

  const handleEditProject = () => {
    history.push({
      pathname: '/projects/add',
      state: { project },
    });
  };

  useEffect(() => {
    console.log('ProjectDetailPage: useEffect: ', profile?.id, event?.id);
  }, []);

  if (!project) {
    return <EmptyPage message='Projekt nicht gefunden' />;
  }

  

  return (
    <IonPage>
      <IonContent>
        <IonGrid>
          <IonRow>
            {/* Projekt Details */}
            <IonCol size="12" sizeLg="8">
              <ProjectDetailCard
                project={project}
                profile={profile}
                onEditClick={handleEditProject}
              />
            </IonCol>

            {/* Teilnehmer Liste */}
            <IonCol size="12" sizeLg="4">
              <ProjectParticipantsCard 
                project={project}
                profile={profile}
                onJoinClick={() => handleJoinProject(project.id, profile?.id!)}
                onRecjectClick={() => handleRejectProject(project.id, profile?.id!)}
                isLoading={loading}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ProjectDetailPage;
