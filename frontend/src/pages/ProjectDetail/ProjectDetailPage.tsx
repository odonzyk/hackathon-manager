import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButtons,
  IonButton,
} from '@ionic/react';
import { Event, Profile, Project } from '../../types/types';
import './ProjectDetailPage.css';
import { getExistingToken } from '../../utils/authUtils';
import {
  deleteInitiator,
  deleteParticipant,
  isOrganisator,
  postInitiator,
  postParticipant,
  ResultType,
} from '../../utils/dataApiConnector';
import { useToast } from '../../components/ToastProvider';
import EmptyPage from '../../components/EmptyPage';
import ProjectDetailCard from '../../components/cards/ProjectDetailCard/ProjectDetailCard';
import ProjectParticipantsCard from '../../components/cards/ProjectParticipantsCard/ProjectParticipantsCard';
import { clipboardOutline, folderOutline, linkOutline } from 'ionicons/icons';

interface ProjectDetailPageProps {
  profile: Profile | null;
  event: Event | null;
  projects: Project[];
  onParticipantChange: () => void;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  profile,
  projects,
  onParticipantChange,
}) => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(false);
  const { showToastMessage, showToastError } = useToast();

  const project = projects.find((p) => p.id === parseInt(id));

  const handleAddParticipant = async (project_id: number, user_id: number) => {
    setLoading(true);
    const token = getExistingToken();
    const result = await postParticipant(project_id, user_id, token);

    console.log(`Adding participant: project_id=${project_id}, user_id=${user_id}`);

    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Fehler beim Speichern des Projekts');
    } else {
      showToastMessage('Projekt erfolgreich beigetreten!');
    }
    onParticipantChange();
    setLoading(false);
  };

  const handleRemoveParticipant = async (project_id: number, user_id: number) => {
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

  const handleCopyEmailsToClipboard = () => {
    if (!project || !project.participants) return;

    let emails = project.initiators.map((initiator) => initiator.email).join(',');
    if (emails && project.participants.length > 0) {
      emails += ',' + project.participants.map((participant) => participant.email).join(',');
    }
    navigator.clipboard
      .writeText(emails)
      .then(() => {
        showToastMessage('E-Mail-Adressen erfolgreich in die Zwischenablage kopiert!');
      })
      .catch(() => {
        showToastError('Fehler beim Kopieren der E-Mail-Adressen.');
      });
  };

  const handleOpenTeamsChannel = () => {
    if (!project || !project.teams_channel_id) {
      showToastError('MS Teams Kanal nicht verfügbar.');
      return;
    }
    const teams_channel_id = project.teams_channel_id;
    const group_id = '3fbaca9f-b59d-4aef-9ad9-24e4d9af582a';
    const tenant_id = '7006e676-abe8-4660-a98f-afd740c750ff';
    let link = `https://teams.microsoft.com/l/channel/19:${teams_channel_id}@thread.tacv2/conversations?groupId=${group_id}&tenantId=${tenant_id}`;

    window.open(link, '_blank');
  };

  const handleEditProject = () => {
    history.push({
      pathname: '/projects/add',
      state: { project },
    });
  };

  const handleRemoveInitiator = async (project_id: number, user_id: number) => {
    if (!isOrganisator(profile)) {
      showToastError('Nur Organisatoren können Initiatoren entfernen.');
      return;
    }
    if (!project?.initiators.length || project.initiators.length <= 1) {
      showToastError('Es muss mindestens ein Initiator vorhanden sein');
      return;
    }

    setLoading(true);
    const token = getExistingToken();
    const result = await deleteInitiator(project_id, user_id, token);

    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Fehler beim Entfernen des Initiators');
    } else {
      showToastMessage('Initiator erfolgreich entfernt!');
    }
    onParticipantChange();
    setLoading(false);
  };

  const handleAddInitiator = async (project_id: number, user_id: number) => {
    setLoading(true);
    const token = getExistingToken();
    const result = await postInitiator(project_id, user_id, token);

    console.log(`Adding initiator: project_id=${project_id}, user_id=${user_id}`);

    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Fehler beim Speichern des Projekts');
    } else {
      showToastMessage('Initiator erfolgreich hinzugefügt!');
    }
    onParticipantChange();
    setLoading(false);
  };

  if (!project) {
    return <EmptyPage message="Projekt nicht gefunden" />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <IonIcon icon={folderOutline} style={{ marginRight: '8px' }} />
            Projekt Details
          </IonTitle>
          <IonButtons slot="end">
            {isOrganisator(profile) && (
              <IonButton onClick={handleCopyEmailsToClipboard} title="E-Mail-Adressen kopieren">
                <IonIcon icon={clipboardOutline} slot="icon-only" />
              </IonButton>
            )}
            <IonButton onClick={handleOpenTeamsChannel} title="MS Teams Kanal öffnen">
              <IonIcon icon={linkOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

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
                onJoinClick={() => handleAddParticipant(project.id, profile?.id!)}
                onRecjectClick={() => handleRemoveParticipant(project.id, profile?.id!)}
                isLoading={loading}
                onRemoveParticipant={handleRemoveParticipant}
                onRemoveInitiator={handleRemoveInitiator}
                onAddParticipant={handleAddParticipant}
                onAddInitiator={handleAddInitiator}
                showToastError={showToastError}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ProjectDetailPage;
