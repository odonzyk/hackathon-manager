import React, { useEffect, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/react';
import { Profile, Project } from '../../types/types';
import { getExistingToken } from '../../utils/authUtils';
import { fetchUserList } from '../../utils/dataFetchUtils';

interface UserSelectionModalProps {
  profile: Profile | null;
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onAddInitiator: (projectId: number, userId: number) => void;
  onAddParticipant: (projectId: number, userId: number) => void;
  showToastError: (message: string) => void;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  profile,
  project,
  isOpen,
  onClose,
  onAddInitiator,
  onAddParticipant,
  showToastError,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);

  useEffect(() => {
    console.log('UserSelectionModal useEffect called');
    if (profile) {
      console.log('Fetching user list for profile:');
      setIsLoadingUsers(true);
      const token = getExistingToken();
      fetchUserList(profile, token, setAllUsers, showToastError);
      setIsLoadingUsers(false);
    }
  }, []);
  useEffect(() => {
    console.log('Set Filtered Users called');
    filterUsers(searchTerm);
  }, [allUsers]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterUsers(term);
  };

  const filterUsers = (term: string) => {
    const filtered = allUsers.filter((user) => {
      const isAlreadyParticipant = project.participants.some(
        (participant) => participant.user_id === user.id,
      );
      const isAlreadyInitiator = project.initiators.some(
        (initiator) => initiator.user_id === user.id,
      );

      return (
        user.name.toLowerCase().includes(term.toLowerCase()) &&
        !isAlreadyParticipant &&
        !isAlreadyInitiator
      );
    });
    setFilteredUsers(filtered);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nutzer hinzufügen</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Schließen</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonSearchbar
          value={searchTerm}
          onIonInput={(e) => handleSearch(e.detail.value!)}
          placeholder="Teilnehmer suchen"
        />
        {isLoadingUsers ? (
          <IonText>Lade Nutzer...</IonText>
        ) : (
          <IonList>
            {filteredUsers.map((user) => (
              <IonItem key={user.id}>
                <IonLabel>{user.name}</IonLabel>
                <IonButton
                  slot="end"
                  color="primary"
                  onClick={() => {
                    onAddInitiator(project.id, user.id);
                    onClose(); // Modal schließen
                  }}
                >
                  Initiator
                </IonButton>
                <IonButton
                  slot="end"
                  color="tertiary"
                  onClick={() => {
                    onAddParticipant(project.id, user.id);
                    onClose(); // Modal schließen
                  }}
                >
                  Teilnehmer
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonModal>
  );
};

export default UserSelectionModal;
