import React from 'react';
import { IonButton } from '@ionic/react';

interface JoinProjectButtonProps {
  statusId: number;
  onJoinProject: () => void;
}

const JoinProjectButton: React.FC<JoinProjectButtonProps> = ({ statusId, onJoinProject }) => {
  if (statusId < 3) {
    return (
      <IonButton expand="block" onClick={onJoinProject}>
        Projekt beitreten
      </IonButton>
    );
  }

  if (statusId === 3) {
    return (
      <IonButton expand="block" disabled={true} color="secondary">
        Projekt abgeschlossen
      </IonButton>
    );
  }

  if (statusId === 4) {
    return (
      <IonButton expand="block" disabled={true} color="danger">
        Projekt abgebrochen
      </IonButton>
    );
  }

  return null;
};

export default JoinProjectButton;