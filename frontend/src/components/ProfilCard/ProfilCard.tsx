import React, { useState } from 'react';
import {
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonButton,
  IonIcon,
  IonPopover,
} from '@ionic/react';
import {
  mailOpenOutline,
  callOutline,
  peopleCircle,
  createOutline,
  calendarOutline,
  trashBinOutline,
  ellipsisVerticalOutline,
} from 'ionicons/icons';
import './ProfilCard.css';
import { Profile, UserRoleMap, VehicleTypeMap } from '../../types/types';
import { t } from 'i18next';

interface ProfileCardProps {
  user: Profile;
  onView: (user: Profile) => void;
  onEdit: (user: Profile) => void;
  onBook: (user: Profile) => void;
  onDelete: (user: Profile) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onView, onEdit, onBook, onDelete }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleButtonClick = (action: () => void) => {
    action();
    setIsPopoverOpen(false); 
  };

  return (
    <IonCard key={user.id} className="profilecard-card">
      <IonGrid className="profilecard-grid" fixed>
        <IonRow className="profilecard-row">
          {/* Avatar-Box */}
          <IonCol size="auto" className="profilecard-col-fixedAvatar">
            <img src={user.avatar_url} className="profilecard-avatar" alt="User Avatar" />
          </IonCol>

          {/* Buchungsinformationen */}
          <IonCol className="profilecard-col-flexible">
            <IonGrid className="profilecard-grid">
              <IonRow>
                <IonCol size="7" className="profilecard-col">
                  <IonText color="primary" className="profilecard-info-label">
                    {user.name}
                  </IonText>
                  <IonText className="profilecard-info-text">
                    <p>
                      <IonIcon
                        icon={mailOpenOutline}
                        className='profilecard-info-labelicon'
                      />
                      {user.email}
                    </p>
                    <p>
                      <IonIcon
                        icon={callOutline}
                        className='profilecard-info-labelicon'
                      />
                      {user.telephone}
                    </p>
                  </IonText>
                  <IonText
                    className="profilecard-info-rolelabel"
                    style={{ color: UserRoleMap[user.role_id].color }}
                  >
                    {UserRoleMap[user.role_id].name}
                  </IonText>
                </IonCol>
                <IonCol size="5" className="profilecard-icon-col">
                  <IonText color="primary" className="profilecard-info-label">
                    {t('component.profilCard.labelVehicle')}
                  </IonText>
                  <ul className="profilecard-list">
                    {user.vehicles.map((vehicle) => {
                      const vehicleType = VehicleTypeMap[vehicle.vehicle_type_id];
                      return (
                        <li key={vehicle.id}>
                          <span className="profilecard-info-item-value">
                            {vehicleType?.emoji || '❓'} {vehicle.licence_plate}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCol>

          {/* Aktionen */}
          <IonCol size="auto" className="profilecard-col-fixedAction">
            <div className="profilecard-actions">
              <IonButton
                id={'hover-trigger_' + user.id} // ID für den Trigger
                fill="solid"
                color="secondary"
                shape="round"
                size="small"
                onClick={() => setIsPopoverOpen(true)} // Öffnet das Popover
              >
                <IonIcon
                  icon={ellipsisVerticalOutline}
                  style={{ color: 'var(--ion-background-color)' }}
                />
              </IonButton>
              <IonPopover
                className="profilecard-actions-menue"
                trigger={'hover-trigger_' + user.id} // Verknüpft das Popover mit dem Button
                isOpen={isPopoverOpen}
                onDidDismiss={() => setIsPopoverOpen(false)} // Schließt das Popover
                alignment="start" // Positioniert das Popover linksbündig
              >
                <div className="profilecard-actions-popover">
                  <IonButton
                    fill="solid"
                    color="secondary"
                    shape="round"
                    size="small"
                    onClick={() => handleButtonClick(() => onView(user))}
                  >
                    <IonIcon icon={peopleCircle} style={{ color: 'var(--ion-background-color)' }} />
                  </IonButton>
                  <IonButton
                    fill="solid"
                    color="secondary"
                    shape="round"
                    size="small"
                    onClick={() => handleButtonClick(() => onEdit(user))}
                  >
                    <IonIcon
                      icon={createOutline}
                      style={{ color: 'var(--ion-background-color)' }}
                    />
                  </IonButton>
                  <IonButton
                    fill="solid"
                    color="secondary"
                    shape="round"
                    size="small"
                    onClick={() => handleButtonClick(() => onBook(user))}
                  >
                    <IonIcon
                      icon={calendarOutline}
                      style={{ color: 'var(--ion-background-color)' }}
                    />
                  </IonButton>
                  <IonButton
                    fill="solid"
                    color="danger"
                    shape="round"
                    size="small"
                    onClick={() => handleButtonClick(() => onDelete(user))}
                  >
                    <IonIcon
                      icon={trashBinOutline}
                      style={{ color: 'var(--ion-background-color)' }}
                    />
                  </IonButton>
                </div>
              </IonPopover>
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonCard>
  );
};

export default ProfileCard;
