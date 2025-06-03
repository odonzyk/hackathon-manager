import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { Profile, Project } from '../../types/types';
import { star, checkmarkCircle, closeCircle, warning, personCircle } from 'ionicons/icons';

interface JoinProjectButtonProps {
  project: Project;
  profile: Profile;
  onJoinProject: () => void;
}

const JoinProjectButton: React.FC<JoinProjectButtonProps> = ({ project, profile, onJoinProject }) => {
  const eventId = project.event_id;
  const statusId = project.status_id;
  const userIsFree = profile.participate.every(
    (participation) => participation.event_id !== eventId
  );
  const userIsInitiator = project.initiators.some(
    (initiator) => initiator.id === profile.id
  );
  const myParticipation = profile.participate.find(
    (participation) => participation.project_id === project.id
  );

  if (statusId === 3) {
    return (
      <IonButton expand="block" disabled={true} color="secondary">
        <IonIcon slot="start" icon={checkmarkCircle}></IonIcon>
        Projekt abgeschlossen
      </IonButton>
    );
  }

  if (statusId === 4) {
    return (
      <IonButton expand="block" disabled={true} color="danger">
        <IonIcon slot="start" icon={closeCircle}></IonIcon>
        Projekt abgebrochen
      </IonButton>
    );
  }

  if (statusId < 3) {
    if (!userIsFree) {
      if (myParticipation) {
        return (
          <IonButton expand="block" disabled={true} color="tertiary">
            <IonIcon slot="start" icon={star}></IonIcon>
            Du bist bereits in diesem Projekt
          </IonButton>
        );
      }

      return (
        <IonButton expand="block" disabled={true} color="warning">
          <IonIcon slot="start" icon={warning}></IonIcon>
          Du bist bereits in einem Projekt
        </IonButton>
      );
    }
    if (userIsInitiator) {
      return (
        <IonButton expand="block" disabled={true} color="secondary">
          <IonIcon slot="start" icon={personCircle}></IonIcon>
          Du bist der Initiator
        </IonButton>
      );
    }

    return (
      <IonButton expand="block" onClick={onJoinProject}>
        <IonIcon slot="start" icon={star}></IonIcon>
        Projekt beitreten
      </IonButton>
    );
  }

  return null;
};

export default JoinProjectButton;