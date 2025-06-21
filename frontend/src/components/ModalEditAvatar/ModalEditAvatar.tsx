import React, { useEffect, useRef, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonFooter,
  IonButtons,
  IonList,
  IonIcon,
} from '@ionic/react';
import { Profile } from '../../types/types';
import { checkmark } from 'ionicons/icons';

interface ModalEditAvatarProps {
  onSave: (updatedProfile: Profile) => void;
  profile: Profile;
}

const avatars = [
  '/assets/avatars/avatar_1.png',
  '/assets/avatars/comic_backend_avatar_1.png',
  '/assets/avatars/comic_backend_avatar_2.png',
  '/assets/avatars/comic_backend_avatar_3.png',
  '/assets/avatars/comic_backend_avatar_4.png',
  '/assets/avatars/comic_buch_avatar_1.png',
  '/assets/avatars/comic_buch_avatar_2.png',
  '/assets/avatars/comic_buch_avatar_3.png',
  '/assets/avatars/comic_buch_avatar_4.png',
  '/assets/avatars/comic_frontend_avatar_1.png',
  '/assets/avatars/comic_frontend_avatar_2.png',
  '/assets/avatars/comic_frontend_avatar_3.png',
  '/assets/avatars/comic_frontend_avatar_4.png',
  '/assets/avatars/comic_mobile_avatar_1.png',
  '/assets/avatars/comic_mobile_avatar_2.png',
  '/assets/avatars/comic_mobile_avatar_3.png',
  '/assets/avatars/comic_mobile_avatar_4.png',
];

const ModalEditAvatar: React.FC<ModalEditAvatarProps> = ({ onSave, profile }) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const [updatedProfile, setUpdatedProfile] = useState<Profile>(profile);
  const [selectedAvatar, setSelectedAvatar] = useState(updatedProfile.avatar_url);

  useEffect(() => {
    setUpdatedProfile(profile);
  }, [profile]);

  const handleSave = () => {
    onSave(updatedProfile);
    dismiss();
  };

  const dismiss = () => {
    modal.current?.dismiss();
    setUpdatedProfile(profile);
  };

  const handleAvatarChange = (url: string) => {
    setSelectedAvatar(url);
    updatedProfile.avatar_url = url;
  };

  return (
    <IonModal
      id="edit-avatar-modal"
      ref={modal}
      trigger="open-edit-avatar-modal"
      className="edit-profile-modal"
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => dismiss()}>Abbrechen</IonButton>
          </IonButtons>
          <IonTitle>
            <center>Avatar auswahl</center>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={handleSave}>
              Speichern
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="wrapper">
          <IonList lines="none">
            {avatars.map((avatar) => (
              <IonItem
                key={avatar}
                button={true}
                detail={false}
                onClick={() => handleAvatarChange(avatar)} // Avatar auswählen
              >
                <IonLabel>
                  <img
                    src={avatar}
                    alt="Avatar"
                    style={{ width: '80px', height: '80px', borderRadius: '50%' }}
                  />
                </IonLabel>
                {selectedAvatar === avatar && (
                  <IonIcon icon={checkmark} size="large" slot="end" color="primary" />
                )}
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle>
            <center></center>
          </IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ModalEditAvatar;
