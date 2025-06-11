import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './ActivationPage.css';
import { RoleTypes } from '../../types/types';
import { postActivate } from '../../utils/dataApiConnector';

const ActivationPage = () => {
  const [statusMessage, setStatusMessage] = useState<string>('Aktivierung wird verarbeitet...');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isInternal, setIsInternal] = useState<boolean>(false);
  const hasActivated = useRef(false); // Verwende useRef, um mehrfachen Aufruf zu verhindern
  const location = useLocation();

  const activateAccount = async () => {
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const activationCode = queryParams.get('ac');

    if (hasActivated.current) {
      return; // Verhindert mehrfaches Aktivieren
    }
    hasActivated.current = true; // Setze den Ref-Wert auf true, um weitere Aufrufe zu blockieren

    if (!email || !activationCode) {
      setStatusMessage('Ungültiger Aktivierungslink.');
      setIsSuccess(false);
      return;
    }

    const response = await postActivate(email, activationCode);
    if (response.resultCode === 200) {
      setIsSuccess(true);
      setIsInternal(response.data?.role === RoleTypes.USER);
      setStatusMessage('Ihr Konto wurde erfolgreich aktiviert.');
    } else {
      if (response.resultCode === 409) {
        setStatusMessage('Ihr Konto wurde bereits aktiviert.');
      } else if (response.resultCode === 404) {
        setStatusMessage('Kein Konto mit dieser E-Mail-Adresse gefunden.');
      } else if (response.resultCode === 400) {
        setStatusMessage('Ungültiger Aktivierungscode. Bitte überprüfen Sie den Link.');
      } else {
        setStatusMessage('Aktivierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
      setIsSuccess(false);
    }
  };

  useEffect(() => {
    activateAccount();
  }, []); // Leeres Abhängigkeitsarray sorgt dafür, dass der Effekt nur einmal ausgeführt wird

  return (
    <IonPage>
      <IonContent>
        <IonCard className="hackathon-card no-hover">
          <IonCardHeader>
            <IonCardTitle>
              {isSuccess === null
                ? 'Aktivierung läuft...'
                : isSuccess
                  ? 'Aktivierung erfolgreich'
                  : 'Aktivierung fehlgeschlagen'}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              {isSuccess === null ? (
                <div style={{ textAlign: 'center' }}>
                  <IonSpinner name="dots" />
                  <p>{statusMessage}</p>
                </div>
              ) : (
                <p>{statusMessage}</p>
              )}
              {isSuccess && (
                <p>
                  {isInternal ? (
                    <>
                      <strong>Hinweis:</strong> Du kannst dich jetzt{' '}
                      <a href="/login">hier einloggen</a>.
                    </>
                  ) : (
                    <>
                      <strong>Hinweis:</strong> Ihr Konto wurde aktiviert, aber es muss noch von
                      einem Administrator freigeschaltet werden. Bitte warten Sie auf die
                      Freischaltung.
                    </>
                  )}
                </p>
              )}
              <br />
              <p>
                Bei Fragen oder Problemen wende dich gerne an uns:
                <br />
                <strong>Kontakt:</strong> <a href="mailto:j.zech@thalia.de">j.zech@thalia.de</a>
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default ActivationPage;
