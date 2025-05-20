import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonCard,
  IonImg,
  IonText,
  IonToggle,
  IonInputPasswordToggle,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/react';
import axios from 'axios';
import './RegisterPage.css';
import { Profile } from '../../types/types';
import { APP_VERSION } from '../../../config';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import { getExistingToken } from '../../utils/authUtils';
import { useToast } from '../../components/ToastProvider';

const emptyProfile: Profile = {
  id: 0,
  role_id: 2,
  name: '',
  email: '',
  is_private_email: false,
  telephone: '',
  is_private_telephone: false,
  avatar_url: '',
};

const ROLE_USER = 2;

const RegisterPage: React.FC = () => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [newProfile, setNewProfile] = useState<Profile>(emptyProfile);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const isAuthenticated = useIsAuthenticated();
  const { showToastMessage, showToastError } = useToast();

  // -- Helper Functions -------------------------------
  const onSubmit = async () => {
    console.log('RegisterPage: onSubmit is triggered');
    setIsButtonDisabled(true);

    if (!newProfile.email || !password) {
      showToastMessage('Bitte geben Sie eine gültige E-Mail und ein Passwort ein.');
      setIsButtonDisabled(false);
      return;
    }
    if (password !== confirmPassword) {
      showToastMessage('Das Passwort muss mit dem Passwort übereinstimmen.');
      setIsButtonDisabled(false);
      return;
    }
    if (password.length < 8) {
      showToastMessage(
        'Das Passwort muss mindestens 8 Zeichen lang sein und mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.',
      );
      setIsButtonDisabled(false);
      return;
    }

    try {
      // API-Aufruf zum Anlegen eines neuen Benutzers
      const response = await axios.post(`/api/user/`, {
        name: newProfile.name,
        email: newProfile.email,
        telephone: newProfile.telephone,
        is_private_email: newProfile.is_private_email,
        is_private_telephone: newProfile.is_private_telephone,
        password: password,
        role_id: ROLE_USER,
      });

      if (response.status === 201) {
        showToastMessage('Benutzer erfolgreich erstellt');
        console.log('RegisterPage: User created successfully', response.data);

        // Weiterleitung zur Login-Seite oder Dashboard
        setTimeout(() => {
          document.location.href = '/login';
        }, 2000);
      } else {
        showToastError('Fehler bei der Registrierung. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      showToastError('Fehler bei der Registrierung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsButtonDisabled(false);
    }
  };

  /**
   * Checks for an existing authentication token in local storage.
   * Validates its expiry and sets the login state.
   * If valid, sets the remaining time and fetches the profile if missing.
   */
  const checkExisingSession = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    const token = getExistingToken();
    if (!token) return false;

    return true;
  };

  // -- Page Logig ---------------------------------------.
  useEffect(() => {
    console.log('RegisterPage: useEffect is triggered', isFirstLoad, isAuthenticated);
    if (isFirstLoad) {
      console.log('RegisterPage: Check already logged in?');
      checkExisingSession().then((sessionExists) => {
        if (sessionExists) {
          setTimeout(() => {
            document.location.href = '/dashboard';
          }, 0);
        }
      });
    }
    setIsFirstLoad(false);
  }, [isFirstLoad]);

  useEffect(() => {
    console.log('RegisterPage: password trigger', passwordError);
  }, [passwordError]);

  const handleInputChange = (field: keyof Profile, value: any) => {
    setNewProfile((prevProfile) => ({
      ...prevProfile,
      [field]: value,
    }));
  };

  const validateForm = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword || password === '' || confirmPassword === '') {
      setPasswordError(true);
      setIsButtonDisabled(true);
    } else if (newProfile.name === '' || newProfile.email === '') {
      setIsButtonDisabled(true);
    } else {
      setPasswordError(false);
      setIsButtonDisabled(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="hackathon-container">
          <div className="appTitle-header">
            <IonImg src="/assets/icons/icon.png" className="appTitle-logo" />
            <div className="appTitle-title">
              <h1>Hackathon Manager</h1>
              <IonText color="primary">v {APP_VERSION}</IonText>
            </div>
          </div>
        </div>

        <IonCard className="hackathon-card register-card">
          <IonCardHeader>
            <IonCardTitle>Persönliche Daten</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonInput
              className="register-input"
              value={newProfile.name}
              labelPlacement="floating"
              label="Name (Benötigt)"
              placeholder="Name eingeben"
              fill="outline"
              required={true}
              onIonChange={(e) => handleInputChange('name', e.detail.value!)}
            />
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <IonInput
                  className="register-input"
                  value={newProfile.email}
                  labelPlacement="floating"
                  label="Email (Benötigt)"
                  placeholder="Email eingeben"
                  fill="outline"
                  required={true}
                  type="email"
                  onIonChange={(e) => handleInputChange('email', e.detail.value!)}
                  style={{ flex: 10 }}
                />
                <IonToggle
                  checked={newProfile.is_private_email}
                  onIonChange={(e) => handleInputChange('is_private_email', e.detail.checked)}
                  style={{ marginLeft: '16px' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <IonInput
                  className="register-input"
                  value={newProfile.telephone}
                  labelPlacement="floating"
                  label="Telefonnummer"
                  placeholder="Telefonnummer eingeben"
                  fill="outline"
                  type="tel"
                  onIonChange={(e) => handleInputChange('telephone', e.detail.value!)}
                  style={{ flex: 10 }}
                />
                <IonToggle
                  checked={newProfile.is_private_telephone}
                  onIonChange={(e) => handleInputChange('is_private_telephone', e.detail.checked)}
                  style={{ marginLeft: '16px' }}
                />
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        <IonCard className="hackathon-card register-card">
          <IonCardHeader>
            <IonCardTitle>Login</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonInput
              className="register-input"
              value={password}
              labelPlacement="floating"
              label="Passwort"
              placeholder="Passwort eingeben"
              fill="outline"
              type="password"
              required={true}
              onIonInput={(e) => {
                setPassword(e.detail.value!);
                validateForm(e.detail.value!, confirmPassword);
              }}
            >
              <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            </IonInput>
            <IonInput
              className="register-input"
              value={confirmPassword}
              labelPlacement="floating"
              label="Passwort wiederholen"
              placeholder="Passwort wiederholen"
              fill="outline"
              type="password"
              required={true}
              onIonInput={(e) => {
                setConfirmPassword(e.detail.value!);
                validateForm(password, e.detail.value!);
              }}
            >
              <IonInputPasswordToggle slot="end"></IonInputPasswordToggle>
            </IonInput>
            {/* Bedingtes Rendering des Fehlertexts */}
            {passwordError && (
              <IonText color="danger" className="password-error">
                Die Passwörter stimmen nicht überein.
              </IonText>
            )}

            <IonButton
              onClick={onSubmit}
              expand="block"
              className="register-button"
              disabled={isButtonDisabled}
            >
              Registrieren
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
