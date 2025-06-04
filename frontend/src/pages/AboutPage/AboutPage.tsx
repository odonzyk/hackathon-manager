import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAvatar,
} from '@ionic/react';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Über uns</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard className="hackathon-card no-hover">
          <IonCardHeader>
            <IonCardTitle>Hackathon Manager</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText className="about-text">Willkommen beim Hackathon Manager!</IonText>
            <br />
            <IonText className="about-hint">
              Diese Plattform wurde entwickelt, um Hackathons effizient zu organisieren und
              Teilnehmern eine einfache Möglichkeit zu bieten, Projekte zu erstellen, Teams zu
              bilden und ihre Ideen zu präsentieren.
              <br />
              Unser Ziel ist es, Innovationen zu fördern und Menschen zusammenzubringen, die
              gemeinsam an spannenden Projekten arbeiten möchten. Egal, ob du Entwickler, Designer
              oder einfach nur ein kreativer Kopf bist – hier findest du die richtige Umgebung, um
              deine Ideen umzusetzen.
            </IonText>
            <br />
            <br />
            <IonText className="about-hint">
              <strong>Hinweis:</strong> Diese App wurde in der Freizeit als Hobbyprojekt entwickelt
              und dient als Demo der Thalia Agentur Plattform. Mit Unterstützung von Thalia DRS, der
              digitalen Agentur von Thalia, wurde sie am Standort Berlin umgesetzt. Für weitere
              Informationen und spannende Inhalte besuchen Sie{' '}
              <a href="https://thalia-drs.de" target="_blank" rel="noopener noreferrer">
                Thalia DRS
              </a>
              .
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonCard className="hackathon-card no-hover">
          <IonCardHeader>
            <IonCardTitle>Kontakt</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText className="about-text">Hast du Fragen oder Feedback?</IonText>
            <br />
            <IonText className="about-hint">
              Kontaktiere uns unter:
              <br />
              <strong>Email:</strong> <a href="mailto:j.zech@thalia.de">j.zech@thalia.de</a>
              <br />
              <strong>Telefon:</strong> +49 172 3023020
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonCard className="hackathon-card no-hover">
          <IonCardHeader>
            <IonCardTitle>Das Team</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="team-member">
              <IonAvatar className="team-avatar">
                <img src="/assets/teamprofile/JensZech.png" alt="Jens Zech" />
              </IonAvatar>
              <div className="team-info">
                <IonText className="team-name">Jens Zech</IonText>
                <IonText className="team-role">Engineering Manager</IonText>
                <IonText className="team-contact">
                  <a href="mailto:j.zech@thalia.de">j.zech@thalia.de</a>
                </IonText>
              </div>
            </div>
            <div className="team-member">
              <IonAvatar className="team-avatar">
                <img src="/assets/teamprofile/OliverDonzyk.png" alt="Oliver Donzyk" />
              </IonAvatar>
              <div className="team-info">
                <IonText className="team-name">Oliver Donzyk</IonText>
                <IonText className="team-role">DevOps</IonText>
                <IonText className="team-contact">
                  <a href="mailto:o.donzyk@thalia.de">o.donzyk@thalia.de</a>
                </IonText>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AboutPage;
