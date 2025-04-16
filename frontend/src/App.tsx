import { IonApp, IonButtons, IonContent, IonHeader, IonItem, IonList, IonMenu, IonMenuButton, IonPage, IonRouterOutlet, IonTitle, IonToolbar, setupIonicReact } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';

import Home from './components/Home';
import HackathonTeams from './components/HackathonTeams';
import HackathonProjects from './components/HackathonProjects';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './App.css';
import './theme/variables.css';
import ThaliaLogo from './assets/thalia_logo.png';

setupIonicReact();

function App() {
  return (
    <IonApp>
           {/* Side Menu */}
           <IonMenu className='hackathon-menu' contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menü</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList>
            <IonItem routerLink="/">🏠 Startseite</IonItem>
            <IonItem routerLink="/projects">📁 Projekte</IonItem>
            <IonItem routerLink="/teams">👥 Teams</IonItem>
            <IonItem routerLink="/login">🔑 Login</IonItem>
          </IonList>
        </IonContent>
      </IonMenu>

      {/* Main Content */}
      <IonPage id="main-content">
        {/* Header */}
        <IonHeader>
          <IonToolbar className="hackathon-toolbar">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <div className="logo">
              <img src={ThaliaLogo} alt="Thalia Logo" className="logo-image" />
              <IonTitle>Thalia Hackathon</IonTitle>
            </div>
          </IonToolbar>
        </IonHeader>

        {/* Content */}
        <IonContent className="hackathon-content">
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/teams" component={HackathonTeams} />
          <Route exact path="/projects" component={HackathonProjects} />
        </IonRouterOutlet>
      </IonReactRouter>
      </IonContent>
      </IonPage>
    </IonApp>
    
  );
}

export default App;