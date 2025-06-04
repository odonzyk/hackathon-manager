import { IonContent, IonPage } from '@ionic/react';
import React from 'react'

const EmptyPage: React.FC<{ message: string }> = ({ message }) => {
    return (
      <IonPage>
        <IonContent>
          <p>{message}</p>
        </IonContent>
      </IonPage>
    );
}

export default EmptyPage;