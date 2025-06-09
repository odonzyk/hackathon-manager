import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
} from '@ionic/react';
import './RequestActivationPage.css';

const RequestActivationPage = () => {
  return (
    <IonPage>
      <IonContent>
        <IonCard className="hackathon-card no-hover">
          <IonCardHeader>
            <IonCardTitle>Aktivierung erforderlich</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>
                Vielen Dank Deine Registrierung!
                <br />
                Eine E-Mail mit einem Aktivierungslink wurde an Deine angegebene E-Mail-Adresse
                gesendet.
              </p>
              <br />
              <p>
                <strong>Unternehmens-E-Mails:</strong> Nach der Aktivierung können Sie sich direkt
                anmelden.
              </p>
              <p>
                <strong>Externe E-Mails:</strong> Nach der Aktivierung muss Ihr Konto von einem
                Administrator freigeschaltet werden. Der Administrator wurde bereits informiert.
              </p>
              <br />
              <p>
                Sollten Sie keine E-Mail erhalten haben, überprüfen Sie bitte Ihren Spam-Ordner oder
                kontaktieren Sie uns. <br />
                <strong>Kontakt:</strong> <a href="mailto:j.zech@thalia.de">j.zech@thalia.de</a>
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default RequestActivationPage;
