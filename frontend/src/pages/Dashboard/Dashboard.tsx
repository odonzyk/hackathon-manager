import React from 'react';
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import './Dashboard.css';


const Dashboard: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
          {/* Countdown Box */}
          <IonCard className="hackathon-card countdown-card">
            <IonCardHeader>
              <IonCardTitle>Hackathon Countdown</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>56 Tage 12 Stunden 44 Minuten</IonCardContent>
          </IonCard>

          {/* Projekte und Teilnehmer Boxen */}
          <IonGrid className="hackathon-grid">
            <IonRow>
              <IonCol>
                <IonCard className="hackathon-card">
                  <IonCardHeader>
                    <IonCardTitle>📁 Projekte</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>21 eingereicht</IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol>
                <IonCard className="hackathon-card">
                  <IonCardHeader>
                    <IonCardTitle>👥 Teilnehmer</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>85 angemeldet</IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Aktuelles Projekt und Raumzuweisung */}
          <IonGrid className="hackathon-grid">
            <IonRow>
              <IonCol>
                <IonCard className="hackathon-card">
                  <IonCardHeader>
                    <IonCardTitle>Dein aktuelles Projekt</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>🤖 SmartCart AI</IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol>
                <IonCard className="hackathon-card">
                  <IonCardHeader>
                    <IonCardTitle>Raum</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>Raum A203</IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
    </IonContent>
        </IonPage>
  );
};

export default Dashboard;