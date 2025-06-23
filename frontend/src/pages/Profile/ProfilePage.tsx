import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonIcon,
  IonCard,
  IonCardContent,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonButtons,
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';
import './ProfilePage.css';
import { Profile, Event } from '../../types/types';
import {
  arrowBackOutline,
  callOutline,
  createOutline,
  eyeOffOutline,
  eyeOutline,
  personCircleOutline,
  shareSocialOutline,
} from 'ionicons/icons';
import ModalEditProfil from '../../components/ModalEditProfil/ModalEditProfil';
import axios from 'axios';
import { getExistingToken } from '../../utils/authUtils';
import ModalEditAvatar from '../../components/ModalEditAvatar/ModalEditAvatar';
import { useToast } from '../../components/ToastProvider';
import { generateRandomPassword, isOrganisator } from '../../utils/dataApiConnector';
import { API_SECRET } from '../../../config';

interface ProfilePageProps {
  profile: Profile | null;
  event?: Event | null; // Optional, falls das Event nicht immer benötigt wird
  onProfileUpdate: (profile: Profile) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, event, onProfileUpdate }) => {
  const [viewProfile, setViewProfile] = useState<Profile | null>(null);
  const { showToastMessage, showToastError } = useToast();

  const history = useHistory();
  const location = useLocation<{ viewProfileArg: Profile }>();
  const viewProfileArg = location.state?.viewProfileArg;

  const shareProfile = () => {
    if (!viewProfile) {
      showToastError('Kein Profil zum Teilen gefunden.');
      return;
    }

    if (navigator.share) {
      navigator
        .share({
          title: `Kontaktdetails von ${viewProfile.name}`,
          text: `Hier sind die Kontaktdetails:\n\nE-Mail: ${viewProfile.email}\nTelefon: ${viewProfile.telephone}`,
        })
        .then(() => console.log('Share erfolgreich'))
        .catch((error) => console.error('Share fehlgeschlagen:', error));
    } else {
      showToastError('Web Share API wird nicht unterstützt.');
    }
  };

  useEffect(() => {
    // console.log('ProfilePage: useEffect: ', isAuthenticated);
    // console.log('ProfilePage: profile', profile);
    // console.log('ProfilePage: viewProfileArg', viewProfileArg);
    // console.log('ProfilePage: viewProfile', viewProfile);

    if (viewProfileArg && viewProfileArg !== viewProfile) {
      setViewProfile(viewProfileArg);
    } else if (profile && profile !== viewProfile) {
      setViewProfile(profile);
    }
  }, [profile, viewProfileArg]);

  useEffect(() => {}, [viewProfile]);

  useEffect(() => {
    if (location.pathname !== '/profil') {
      setViewProfile(null);
    } else if (!viewProfile && !viewProfileArg) {
      setViewProfile(profile);
    }
  }, [location.pathname]);

  const handleSave = (updatedProfile: Profile) => {
    //setProfile(updatedProfile);
    updateProfile(updatedProfile);
    setViewProfile(updatedProfile);
  };

  const updateProfile = async (changedProfile: Profile | null) => {
    if (!changedProfile) {
      showToastError(`viewProfile.email`);
      return;
    }

    const token = getExistingToken();
    if (!token) {
      showToastError('Kein Token gefunden. Bitte melden Sie sich an.');
      return;
    }

    try {
      const response = await axios.put(`/api/user/${changedProfile.id}`, changedProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        showToastMessage('Profil erfolgreich aktualisiert.');
      } else {
        showToastError('Fehler beim Aktualisieren des Profils.');
      }
    } catch (error) {
      showToastError('Fehler beim Aktualisieren des Profils.');
    }
    onProfileUpdate(changedProfile);
  };

  const handleEditPassword = () => {
    showToastMessage('Not implemented');
  };

  const handleResetPassword = async () => {
    if (!viewProfile) {
      showToastError('Kein Benutzer ausgewählt.');
      return;
    }
    const token = getExistingToken();
    if (!token) {
      showToastError('Kein Token gefunden. Bitte melden Sie sich an.');
      return;
    }

    try {
      const response = await axios.post(
        `/api/user/pwreset`,
        {
          id: viewProfile.id,
          email: viewProfile.email,
          password: generateRandomPassword(),
          secret: API_SECRET,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 201) {
        showToastMessage('Passwort erfolgreich zurückgesetzt.');
      } else {
        showToastError('Fehler beim Zurücksetzen des Passworts.');
      }
    } catch (error) {
      showToastError('Fehler beim Zurücksetzen des Passworts.');
    }
  };

  const participation = profile?.participate?.find(
    (participation) => participation.event_id === event?.id,
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {viewProfileArg && (
            <IonButtons slot="start">
              <IonButton onClick={() => history.goBack()}>
                <IonIcon icon={arrowBackOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          )}

          <IonTitle>
            <IonIcon icon={personCircleOutline} />
            Profil
          </IonTitle>
          <IonButtons slot="end">
            {/* Call-Button */}
            <IonButton href={'tel:' + viewProfile?.telephone}>
              <IonIcon icon={callOutline} slot="icon-only" />
            </IonButton>

            {/* Share-Button */}
            <IonButton onClick={shareProfile}>
              <IonIcon icon={shareSocialOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <>
          {viewProfile ? (
            <>
              <div className="profile-header-section">
                <div className="profile-bg"></div>
                <div className="profile-avatar-container">
                  <img src={viewProfile.avatar_url} className="profile-avatar" alt="User Avatar" />
                  {(isOrganisator(profile) || viewProfile.id === profile?.id) && (
                    <IonIcon
                      icon={createOutline}
                      className="avatar-edit-icon"
                      id="open-edit-avatar-modal"
                    />
                  )}
                </div>
              </div>

              <IonCard className="hackathon-card profile-info-card">
                <IonCardContent className="profile-info-card-content">
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12" className="profile-name">
                        <IonText>{viewProfile.name}</IonText>
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol size="3" className="profile-info-item-label">
                        E-Mail
                      </IonCol>
                      <IonCol size="6">{viewProfile.email}</IonCol>
                      <IonCol size="3">
                        <div className="profile-info-item-icon-container">
                          <IonIcon
                            icon={viewProfile.is_private_email ? eyeOffOutline : eyeOutline}
                            className="profile-info-item-icon"
                          />
                          <IonText className="profile-info-item-icon-text">
                            {viewProfile.is_private_email ? 'Privat' : 'Sichtbar'}
                          </IonText>
                        </div>
                      </IonCol>
                    </IonRow>

                    {/* Zeile 2: Telefon */}
                    <IonRow>
                      <IonCol size="3" className="profile-info-item-label">
                        Telefone
                      </IonCol>
                      <IonCol size="6">{viewProfile.telephone}</IonCol>
                      <IonCol size="3">
                        <div className="profile-info-item-icon-container">
                          <IonIcon
                            icon={viewProfile.is_private_telephone ? eyeOffOutline : eyeOutline}
                            className="profile-info-item-icon"
                          />
                          <IonText className="profile-info-item-icon-text">
                            {viewProfile.is_private_telephone ? 'Privat' : 'Sichtbar'}
                          </IonText>
                        </div>
                      </IonCol>
                    </IonRow>

                    {/* Zeile 3: Fahrzeuge */}
                    <IonRow className="profile-info-row">
                      <IonCol size="12" className="profile-info-item-label">
                        Meine eingereichten Projekte
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol size="1" className="profile-info-item-label"></IonCol>
                      <IonCol size="11">
                        {viewProfile.initiate.length > 0 ? (
                          viewProfile.initiate.map((project, index) => (
                            <div key={index} className="profile-project-item">
                              {project.idea}
                            </div>
                          ))
                        ) : (
                          <IonText color="medium">Kein Projekte eingereicht</IonText>
                        )}
                      </IonCol>
                    </IonRow>

                    {/* Zeile 4: Letzter Parkvorgang */}
                    <IonRow>
                      <IonCol size="12" className="profile-info-item-label">
                        Aktuel unterstütztes Projekt
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol size="1" className="profile-info-item-label"></IonCol>
                      <IonCol size="11">
                        {participation?.idea || (
                          <>
                            <IonText className="myproject-text">Kein Projekt ausgewählt.</IonText>
                          </>
                        )}
                      </IonCol>
                    </IonRow>
                  </IonGrid>

                  <IonButton
                    expand="block"
                    className="password-button"
                    onClick={handleEditPassword}
                    disabled={viewProfile?.id !== profile?.id} // Nur für den eigenen Benutzer aktiv
                  >
                    Passwort ändern
                  </IonButton>

                  {isOrganisator(profile) && (
                    <IonButton
                      expand="block"
                      className="password-reset-button"
                      onClick={handleResetPassword}
                    >
                      Passwort zurücksetzen
                    </IonButton>
                  )}
                </IonCardContent>
              </IonCard>
              {(isOrganisator(profile) || viewProfile.id === profile?.id) && (
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                  <IonFabButton id={`open-edit-profile-modal-${viewProfile?.id}`}>
                    <IonIcon icon={createOutline} />
                  </IonFabButton>
                </IonFab>
              )}
            </>
          ) : null}
        </>

        {viewProfile ? (
          <>
            <ModalEditProfil
              onSave={handleSave}
              viewProfile={viewProfile}
              profile={profile}
              onDidDismiss={() => console.log('Modal closed')}
            />
            <ModalEditAvatar onSave={handleSave} profile={viewProfile} />
          </>
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
