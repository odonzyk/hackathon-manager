import React, { useEffect, useRef, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonToggle,
  IonFooter,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonIcon,
} from '@ionic/react';
import { Profile, UserRoleMap } from '../../types/types';
import { isOrganisator } from '../../utils/dataApiConnector';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';

interface ModalEditProfilProps {
  onSave: (updatedProfile: Profile) => void;
  viewProfile: Profile;
  profile: Profile | null;
  onDidDismiss: () => void;
}

const ModalEditProfil: React.FC<ModalEditProfilProps> = ({
  onSave,
  viewProfile,
  profile,
  onDidDismiss,
}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const [updatedProfile, setUpdatedProfile] = useState<Profile>(viewProfile);

  useEffect(() => {
    setUpdatedProfile(viewProfile);
  }, [viewProfile]);

  const handleSave = () => {
    onSave(updatedProfile);
    dismiss();
  };

  const dismiss = () => {
    modal.current?.dismiss();
    setUpdatedProfile(viewProfile);
  };

  const handleInputChange = (field: keyof Profile, value: any) => {
    setUpdatedProfile((prevProfile) => ({
      ...prevProfile,
      [field]: value,
    }));
  };

  console.log('ModalEditProfil', updatedProfile.id);

  return (
    <IonModal
      id={`edit-profile-modal-${viewProfile.id}`}
      ref={modal}
      trigger={`open-edit-profile-modal-${viewProfile.id}`}
      className="edit-profile-modal"
      onDidDismiss={onDidDismiss}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={dismiss}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>
            <center>Profil bearbeiten</center>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={handleSave}>
              <IonIcon icon={checkmarkOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonLabel position="stacked">Name</IonLabel>
          <IonInput
            value={updatedProfile.name}
            onIonChange={(e) => handleInputChange('name', e.detail.value!)}
            placeholder="Name eingeben"
            fill="outline"
          />
        </IonItem>
        <IonItem>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <IonLabel position="stacked">Email</IonLabel>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <IonInput
                value={updatedProfile.email}
                onIonChange={(e) => handleInputChange('email', e.detail.value!)}
                placeholder="Email eingeben"
                fill="outline"
                type="email"
                style={{ flex: 10 }}
              />
              <IonToggle
                checked={updatedProfile.is_private_email}
                onIonChange={(e) => handleInputChange('is_private_email', e.detail.checked)}
                style={{ marginLeft: '16px' }}
              />
            </div>
          </div>
        </IonItem>
        <IonItem>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <IonLabel position="stacked">Telefon</IonLabel>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <IonInput
                value={updatedProfile.telephone}
                onIonChange={(e) => handleInputChange('telephone', e.detail.value!)}
                placeholder="Telefonnummer eingeben"
                fill="outline"
                type="tel"
                style={{ flex: 10 }}
              />
              <IonToggle
                checked={updatedProfile.is_private_telephone}
                onIonChange={(e) => handleInputChange('is_private_telephone', e.detail.checked)}
                style={{ marginLeft: '16px' }}
              />
            </div>
          </div>
        </IonItem>
        {isOrganisator(profile) && (
          <IonItem>
            <IonLabel position="stacked">Rolle</IonLabel>
            <IonSelect
              fill="outline"
              placeholder="Rolle auswählen"
              value={updatedProfile.role_id} // Aktueller Wert
              onIonChange={(e) => handleInputChange('role_id', e.detail.value)}
            >
              {Object.entries(UserRoleMap).map(([key, value]) => (
                <IonSelectOption key={key} value={parseInt(key, 10)}>
                  {value.emoji} {value.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        )}
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle>
            <center>Private angaben sehen nur Sie und Organisatoren</center>
          </IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
};

export default ModalEditProfil;
