import React, { useState } from 'react';
import './ProjectParticipantsCard.css';
import { Profile, Project } from '../../../types/types';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
} from '@ionic/react';
import { peopleCircleOutline, personOutline, trashOutline, personAddOutline } from 'ionicons/icons';
import JoinProjectButton from '../../buttons/JoinProjectButton/JoinProjectButton';
import { isOrganisator } from '../../../utils/dataApiConnector';
import UserSelectionModal from '../../ModalUserSelection/ModalUserSelection';

interface ProjectParticipantsCardProps {
  project: Project;
  profile: Profile | null;
  onJoinClick: () => void;
  onRecjectClick: () => void;
  isLoading?: boolean;
  onRemoveParticipant: (project_id: number, user_id: number) => void;
  onRemoveInitiator: (project_id: number, user_id: number) => void;
  onAddParticipant: (project_id: number, user_id: number) => void;
  onAddInitiator: (project_id: number, user_id: number) => void;
  showToastError: (message: string) => void;
}

const ProjectParticipantsCard: React.FC<ProjectParticipantsCardProps> = ({
  project,
  profile,
  onJoinClick,
  onRecjectClick,
  isLoading,
  onRemoveParticipant,
  onRemoveInitiator,
  onAddParticipant,
  onAddInitiator,
  showToastError,
}) => {
  const [showModal, setShowModal] = useState(false);
  const isOrganiser = isOrganisator(profile);

  return (
    <>
      <IonCard className="hackathon-card participant-card">
        <IonCardHeader>
          <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Teilnehmer</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {project.initiators.map((initiator) => (
              <IonItem key={`initiator-${initiator.id}`}>
                <IonIcon icon={personOutline} slot="start" color="primary" />
                <IonLabel>{initiator.name}</IonLabel>
                {isOrganiser && (
                  <IonButtons slot="end">
                    <IonButton
                      onClick={() => onRemoveInitiator(project.id, initiator.user_id)}
                      className="round-button round-danger"
                    >
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </IonButtons>
                )}
              </IonItem>
            ))}
            {project.participants.map((participant) => (
              <IonItem key={`participant-${participant.id}`}>
                <IonIcon icon={peopleCircleOutline} slot="start" color="quaternary" />
                <IonLabel>{participant.name}</IonLabel>
                {isOrganiser && (
                  <IonButtons slot="end">
                    <IonButton
                      slot="end"
                      onClick={() => onRemoveParticipant(project.id, participant.user_id)}
                      className="round-button round-danger"
                    >
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </IonButtons>
                )}
              </IonItem>
            ))}
            <IonItem>
              <IonLabel>
                <IonText>
                  {project.participants.length + project.initiators.length} (von max.{' '}
                  {project.max_team_size})
                </IonText>
              </IonLabel>
            </IonItem>
          </IonList>
          <div className="join-project-button-container">
            <JoinProjectButton
              project={project}
              profile={profile!}
              onRejectProject={onRecjectClick}
              onJoinProject={onJoinClick}
              disabled={isLoading}
            />
          </div>

          {isOrganiser && (
            <IonFab vertical="bottom" horizontal="end" slot="fixed" className="fab-inside-card">
              <IonFabButton color="primary" onClick={() => setShowModal(true)}>
                <IonIcon icon={personAddOutline} />
              </IonFabButton>
            </IonFab>
          )}
        </IonCardContent>
      </IonCard>

      {/* Ausgelagerte Modal-Komponente */}
      <UserSelectionModal
        project={project}
        profile={profile}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddInitiator={onAddInitiator}
        onAddParticipant={onAddParticipant}
        showToastError={showToastError}
      />
    </>
  );
};

export default ProjectParticipantsCard;
