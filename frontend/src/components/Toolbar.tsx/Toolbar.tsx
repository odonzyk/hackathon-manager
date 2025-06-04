import React from 'react';
import { IonToolbar, IonButtons, IonMenuButton, IonTitle, IonSelect, IonSelectOption } from '@ionic/react';
import './Toolbar.css';
import ThaliaLogo from '../../assets/thalia_logo.png';
import { Event } from '../../types/types';

interface ToolbarProps {
  events: Event[];
  selectedEvent: Event | null;
  onSelectEvent: (selectedId: number) => void;
}


const Toolbar: React.FC<ToolbarProps> = ({ selectedEvent, events, onSelectEvent}) => {
  return (
    <IonToolbar className="hackathon-toolbar">
      <IonButtons slot="start">
        <IonMenuButton />
      </IonButtons>
      <div className="hackathon-toolbar-container">
        <div className="hackathon-toolbar-left">
          <img src={ThaliaLogo} alt="Thalia Muse" className="hackathon-toolbar-logo" />
          <IonTitle className="hackathon-toolbar-title">Hackathon Manager</IonTitle>
        </div>
        <div className="hackathon-toolbar-right">
          <IonSelect
            value={selectedEvent?.id}
            placeholder="Event auswählen"
            onIonChange={(e) => {
              onSelectEvent(e.detail.value);
            }}
            interface="popover"
          >
            {events.map((event) => (
              <IonSelectOption key={event.id} value={event.id}>
                {event.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>
      </div>
    </IonToolbar>
  );
};

export default Toolbar;
