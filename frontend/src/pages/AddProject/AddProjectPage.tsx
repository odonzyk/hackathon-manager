import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonTextarea,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonList,
  IonIcon,
} from '@ionic/react';
import { Event, Profile, Project } from '../../types/types';
import { bulbOutline, constructOutline, flagOutline, peopleOutline } from 'ionicons/icons';
import { getExistingToken } from '../../utils/authUtils';
import { postProject, ResultType } from '../../utils/globalDataUtils';
import { useToast } from '../../components/ToastProvider';
import { useHistory } from 'react-router-dom';

interface AddProjectPageProps {
  profile: Profile | null;
  event: Event | null;
  onProjectAdded: () => void;
}

const emptyProject: Project = {
  event_id: 0,
  id: 0,
  status_id: 1,
  idea: '',
  description: '',
  team_name: '',
  goal: '',
  components: '',
  skills: '',
  initiators: [],
};

const AddProjectPage: React.FC<AddProjectPageProps> = ({ profile, event, onProjectAdded }) => {
  const [newProject, setNewProject] = useState<Project>(emptyProject);
  const [loading, setLoading] = useState<boolean>(false);
  const { showToastMessage, showToastError } = useToast();
  const history = useHistory();

  // Funktion zum Aktualisieren des Projekts
  const handleInputChange = (field: keyof Project, value: string) => {
    setNewProject((prevProject) => ({
      ...prevProject,
      [field]: value,
    }));
  };

  // Funktion zum Hinzufügen des Projekts
  const handleAddProject = async () => {
    setLoading(true);
    const token = getExistingToken();
    const result = await postProject(newProject, token);
    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Fehler beim Hinzufügen des Projekts');
    } else {
      showToastMessage('Projekt erfolgreich hinzugefügt!');
      onProjectAdded();
      history.push('/projects'); 
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Initialisiere das leere Projekt beim Laden der Seite
    setNewProject({
      ...emptyProject,
      event_id: event?.id || 0,
      initiators: profile ? [{ id: profile.id, name: profile.name, avatar_url: profile.avatar_url }] : [],
    });
  }, [event, profile]);

  return (
    <IonPage>
      <IonContent>
        <IonCard className="hackathon-card project-detail-card">
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              Neue Projektidee einreichen
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText className="project-detail">
              Hier könnt ihr eure eigene Idee beschreiben und am Pitching Day vorstellen
            </IonText>

            <IonList>
              <IonItem>
                <IonIcon icon={peopleOutline} slot="start" style={{ color: '#007bff' }} />
                <IonLabel>
                  <h2>Idee / Projekt Titel</h2>
                  <IonInput
                    value={newProject.idea}
                    fill="outline"
                    counter={true}
                    maxlength={100}
                    onIonChange={(e) => handleInputChange('idea', e.detail.value!)}
                  />
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={peopleOutline} slot="start" style={{ color: '#007bff' }} />
                <IonLabel>
                  <h2>Beschreibung</h2>
                  <IonTextarea
                    value={newProject.description}
                    fill="outline"
                    autoGrow={true}
                    counter={true}
                    maxlength={1000}
                    onIonChange={(e) => handleInputChange('description', e.detail.value!)}
                  />
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={peopleOutline} slot="start" style={{ color: '#007bff' }} />
                <IonLabel>
                  <h2>Team Name</h2>
                  <IonInput
                    value={newProject.team_name}
                    fill="outline"
                    counter={true}
                    maxlength={100}
                    onIonChange={(e) => handleInputChange('team_name', e.detail.value!)}
                  />
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={flagOutline} slot="start" style={{ color: '#ffc107' }} />
                <IonLabel>
                  <h2>Ziel des Projekts</h2>
                  <IonTextarea
                    value={newProject.goal}
                    fill="outline"
                    autoGrow={true}
                    counter={true}
                    maxlength={1000}
                    onIonChange={(e) => handleInputChange('goal', e.detail.value!)}
                  />
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={constructOutline} slot="start" style={{ color: '#17a2b8' }} />
                <IonLabel>
                  <h2>Benötigte Komponenten, Hardware, Materialien</h2>
                  <IonTextarea
                    value={newProject.components}
                    fill="outline"
                    autoGrow={true}
                    counter={true}
                    maxlength={1000}
                    onIonChange={(e) => handleInputChange('components', e.detail.value!)}
                  />
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={bulbOutline} slot="start" style={{ color: '#6f42c1' }} />
                <IonLabel>
                  <h2>Benötigte Fähigkeiten, Know How, etc.</h2>
                  <IonTextarea
                    value={newProject.skills}
                    fill="outline"
                    autoGrow={true}
                    counter={true}
                    maxlength={1000}
                    onIonChange={(e) => handleInputChange('skills', e.detail.value!)}
                  />
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCol size="12">
          <IonButton expand="block" color="primary" onClick={handleAddProject} disabled={loading}>
            {loading ? 'Wird hinzugefügt...' : 'Projekt hinzufügen'}
          </IonButton>
        </IonCol>
      </IonContent>
    </IonPage>
  );
};

export default AddProjectPage;