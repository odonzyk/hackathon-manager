import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ReactGA from 'react-ga4';

import useSignIn from 'react-auth-kit/hooks/useSignIn';
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';

import { cleanUpStorage, getExistingToken } from '../../utils/authUtils';
import { getProfile, ResultType } from '../../utils/dataApiConnector';
import { STORAGE_PROFILE, STORAGE_TOKEN, User } from '../../types/types';
import { APP_VERSION, SUPPORT_EMAIL } from '../../../config';
import { useToast } from '../../components/ToastProvider';
import './LoginPage.css';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonImg,
  IonInput,
  IonPage,
  IonText,
} from '@ionic/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const signIn = useSignIn();
  const signOut = useSignOut();
  const isAuthenticated = useIsAuthenticated();
  const { showToastMessage, showToastError } = useToast();

  console.log('LoginPage: Rendered');

  // -- Login Function --------------------------------------
  /**
   * Handles the login process.
   * Sends the email and password to the backend, receives the token,
   * stores it in local storage, fetches the user profile, and redirects to the parking lot.
   */
  const onSubmit = async () => {
    console.log('LoginPage: handleLogin is triggered');

    if (!email || !password) {
      showToastMessage('Fehlerhaftes Login oder Passwort');
      return;
    }

    try {
      const response = await axios.post(`/api/user/login`, { email, password });
      const data = response.data;
      console.log('LoginPage: Login successful', data);

      const success = signIn({
        auth: { token: data.token, type: 'Bearer' },
      });
      if (!success) {
        showToastMessage('Login fehlgeschlagen');
        return;
      }

      const userData: User = jwtDecode(data.token);
      const userProfile = await getProfile(userData.id, data.token);
      if (userProfile.resultType !== ResultType.SUCCESS || userProfile.data === null) {
        showToastError(userProfile.resultMsg ?? 'Error');
        return;
      }
      localStorage.setItem(STORAGE_TOKEN, data.token);
      localStorage.setItem(STORAGE_PROFILE, JSON.stringify(userProfile.data));

      console.log('LoginPage: Successful logged in ==> ParkingLot');
      setTimeout(() => {
        document.location.href = '/dashboard';
      }, 0);
    } catch (error) {
      showToastMessage('Login fehlgeschlagen');
    }
  };

  /**
   * Checks for an existing authentication token in local storage.
   * Validates its expiry and sets the login state.
   * If valid, sets the remaining time and fetches the profile if missing.
   */
  const checkExisingSession = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    console.log('LoginPage: Try to read Token');
    const token = getExistingToken();
    if (!token) {
      console.log('LoginPage: No Token found');
      cleanUpStorage();
      signOut();
      return false;
    }

    console.log('LoginPage: Check Profil');
    const profile = localStorage.getItem(STORAGE_PROFILE);
    if (!profile) {
      console.log('LoginPage: No Profile found');
      const userData: User = jwtDecode(token);
      const userProfile = await getProfile(userData.id, token);
      if (userProfile.resultType !== ResultType.SUCCESS || userProfile.data === null) {
        showToastError('Login fehlgeschlagen');
        cleanUpStorage();
        signOut();

        return false;
      }
      localStorage.setItem(STORAGE_PROFILE, JSON.stringify(userProfile.data));
    }
    return true;
  };

  // -- Page Logig ---------------------------------------.
  useEffect(() => {
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
  }, []);

  useEffect(() => {
    console.log('LoginPage: useEffect is triggered', isFirstLoad, isAuthenticated);
    if (isFirstLoad) {
      console.log('LoginPage: Read Token');
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

          <IonCard className="hackathon-card login-card">
            <IonCardHeader>
              <IonCardTitle>Login</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <IonInput
                className="login-input"
                value={email}
                labelPlacement="floating"
                label="Email"
                fill="outline"
                type="email"
                onIonChange={(e) => setEmail(e.detail.value!)}
              />

              <IonInput
                className="login-input"
                value={password}
                labelPlacement="floating"
                label="Password"
                fill="outline"
                type="password"
                onIonChange={(e) => setPassword(e.detail.value!)}
              />

              <IonButton onClick={onSubmit} expand="block">
                Login
              </IonButton>

              <div className="login-links">
                <IonText color="primary">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=Hackathon Manager - Passwort vergessen&body=Bitte helfen Sie mir, mein Passwort zurückzusetzen.`}
                  >
                    Passwort vergessen
                  </a>
                </IonText>
                <IonText color="primary" className="login-link-spacing">
                  <a href="/register">Neu registrieren</a>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
