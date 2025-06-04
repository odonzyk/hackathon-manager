import { useHistory } from 'react-router';
import { menuController } from '@ionic/core/components';
import useIsAuthenticated from 'react-auth-kit/hooks/useIsAuthenticated';
import useSignOut from 'react-auth-kit/hooks/useSignOut';

import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonText,
} from '@ionic/react';

import {
  logOutOutline,
  logInOutline,
  peopleOutline,
  folderOutline,
  homeOutline,
  informationOutline,
  calendarOutline,
} from 'ionicons/icons';

import { APP_VERSION } from '../../../config';
import { cleanUpStorage } from '../../utils/authUtils';

import './Menu.css';

const Menu = () => {
  const history = useHistory();
  const signOut = useSignOut();
  const isAuthenticated = useIsAuthenticated();
  const handleLogout = () => {
    if (!isAuthenticated) return;

    cleanUpStorage();
    signOut();
    setTimeout(() => {
      document.location.href = '/login';
    }, 0);
  };

  const menuItems = [
    { link: '/dashboard', icon: homeOutline, labelKey: 'Dashboard' },
    { link: '/events', icon: calendarOutline, labelKey: 'Events' },
    { link: '/projects', icon: folderOutline, labelKey: 'Projekte' },
    { link: '/teams', icon: peopleOutline, labelKey: 'Teams' },
    { link: '/about', icon: informationOutline, labelKey: 'Über uns' },
  ];

  return (
    <IonMenu menuId="main-menu" contentId="main-content">
      <IonHeader>
        <IonToolbar>
          <IonTitle className="menu-title">Menü</IonTitle>
          <IonText slot="end" className="menu-version">
            v{APP_VERSION}
          </IonText>
        </IonToolbar>
      </IonHeader>

      <IonContent className="menue-content">
        <div className="menu-inner">
          <IonList>
            {menuItems.map(({ link, icon, labelKey }) => (
              <IonItem
                key={link}
                button
                routerLink={link}
                disabled={!isAuthenticated}
                onClick={() => menuController.close()}
              >
                <IonIcon icon={icon} slot="start" />
                <IonLabel>{labelKey}</IonLabel>
              </IonItem>
            ))}

            <IonItem
              button
              onClick={() => {
                if (isAuthenticated) {
                  handleLogout();
                  menuController.close();
                } else {
                  history.push('/login');
                  menuController.close();
                }
              }}
            >
              <IonIcon icon={isAuthenticated ? logOutOutline : logInOutline} slot="start" />
              <IonLabel>{isAuthenticated ? 'Logout' : 'Login'}</IonLabel>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
