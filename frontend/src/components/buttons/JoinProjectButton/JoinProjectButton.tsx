import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { Profile, Project, ProjectStatus } from '../../../types/types';
import { star, checkmarkCircle, closeCircle, warning, personCircle } from 'ionicons/icons';
import { isDemo } from '../../../utils/dataApiConnector';

interface JoinProjectButtonProps {
  project: Project;
  profile: Profile;
  onJoinProject: () => void;
  onRejectProject: () => void;
  disabled?: boolean;
}

const JoinProjectButton: React.FC<JoinProjectButtonProps> = ({
  project,
  profile,
  onJoinProject,
  onRejectProject,
  disabled = false,
}) => {
  const eventId = project.event_id;
  const statusId = project.status_id;
  const isEventParticipator = profile.participate.some(
    (participation) => participation.event_id === eventId,
  );
  const isEventInitiator = profile.initiate.some((initiation) => initiation.event_id === eventId);
  const userIsFree = !isEventParticipator && !isEventInitiator;

  const isInitiator = project.initiators.some((initiator) => initiator.user_id === profile?.id);
  const isParticipant = project.participants?.some((p) => p.user_id === profile?.id);

  const countTeamMembers = project.participants.length + project.initiators.length;
  const isFull = countTeamMembers >= project.max_team_size;

  if (statusId === ProjectStatus.ENDED) {
    return (
      <IonButton expand="block" disabled={true} color="secondary">
        <IonIcon slot="start" icon={checkmarkCircle}></IonIcon>
        Projekt abgeschlossen
      </IonButton>
    );
  }

  if (statusId === ProjectStatus.CANCELD) {
    return (
      <IonButton expand="block" disabled={true} color="danger">
        <IonIcon slot="start" icon={closeCircle}></IonIcon>
        Projekt abgebrochen
      </IonButton>
    );
  }

  if (statusId <= ProjectStatus.ACTIVE) {
    if (isParticipant) {
      return (
        <IonButton expand="block" onClick={onRejectProject} disabled={disabled} color="tertiary">
          <IonIcon slot="start" icon={star}></IonIcon>
          Teilnahme zurückziehen
        </IonButton>
      );
    }

    if (isInitiator) {
      return (
        <IonButton expand="block" disabled={true} color="secondary">
          <IonIcon slot="start" icon={personCircle}></IonIcon>
          Du bist der Initiator
        </IonButton>
      );
    }

    if (!userIsFree) {
      return (
        <IonButton expand="block" disabled={true} color="warning">
          <IonIcon slot="start" icon={warning}></IonIcon>
          Du bist bereits in einem anderen Projekt
        </IonButton>
      );
    }

    if (isFull) {
      return (
        <IonButton expand="block" disabled={true} color="danger">
          <IonIcon slot="start" icon={closeCircle}></IonIcon>
          Projekt voll
        </IonButton>
      );
    }

    if (!isDemo(profile)) {
      return (
        <IonButton expand="block" onClick={onJoinProject} disabled={disabled}>
          <IonIcon slot="start" icon={star}></IonIcon>
          Projekt beitreten
        </IonButton>
      );
    } else {
      return (
        <IonButton expand="block" disabled={true}>
          <IonIcon slot="start" icon={star}></IonIcon>
          Demo-Modus: Projekt beitreten nicht möglich
        </IonButton>
      );
    }
  }

  return null;
};

export default JoinProjectButton;
