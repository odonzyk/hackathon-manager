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
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { ActivityStatusMap, Event, Profile, Project } from '../../types/types';
import {
  bulbOutline,
  chatbubblesOutline,
  constructOutline,
  documentTextOutline,
  flagOutline,
  locationOutline,
  peopleCircleOutline,
  peopleOutline,
  playCircleOutline,
} from 'ionicons/icons';
import { getExistingToken } from '../../utils/authUtils';
import { isOrganisator, postProject, putProject, ResultType } from '../../utils/dataApiConnector';
import { useToast } from '../../components/ToastProvider';
import { useHistory, useLocation } from 'react-router-dom';

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
  max_team_size: 20,
  teams_channel_id: '',
  location: '',
  initiators: [],
  participants: [],
};

const AddProjectPage: React.FC<AddProjectPageProps> = ({ profile, event, onProjectAdded }) => {
  const location = useLocation<{ project?: Project }>();
  const [newProject, setNewProject] = useState<Project>(location.state?.project || emptyProject);
  const [loading, setLoading] = useState<boolean>(false);
  const { showToastMessage, showToastError } = useToast();
  const history = useHistory();

  const isEditing = !!location.state?.project;

  // Funktion zum Aktualisieren des Projekts
  const handleInputChange = (field: keyof Project, value: string | number) => {
    setNewProject((prevProject) => ({
      ...prevProject,
      [field]: value,
    }));
  };

  // Funktion zum Hinzufügen oder Aktualisieren des Projekts
  const handleAddProject = async () => {
    setLoading(true);
    const token = getExistingToken();
    const result = isEditing
      ? await putProject(newProject, token) // Update bestehendes Projekt
      : await postProject(newProject, token); // Neues Projekt erstellen

    if (result.resultType !== ResultType.SUCCESS || result.data === null) {
      showToastError(result.resultMsg ?? 'Fehler beim Speichern des Projekts');
    } else {
      showToastMessage(
        isEditing ? 'Projekt erfolgreich aktualisiert!' : 'Projekt erfolgreich hinzugefügt!',
      );
      onProjectAdded();
      history.push('/projects');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isEditing) {
      // Initialisiere das leere Projekt beim Laden der Seite
      setNewProject({
        ...emptyProject,
        event_id: event?.id || 0,
        initiators: profile
          ? [
              {
                id: 0,
                user_id: profile.id,
                name: profile.name,
                email: profile.email,
                avatar_url: profile.avatar_url,
              },
            ]
          : [],
      });
    }
  }, [event, profile, isEditing]);

  return (
    <IonPage>
      <IonContent>
        <IonCard className="hackathon-card project-detail-card">
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {isEditing ? 'Projektidee bearbeiten' : 'Neue Projektidee einreichen'}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText className="project-detail">
              Hier könnt ihr eure Idee beschreiben und am Pitching Day vorstellen
            </IonText>

            <IonList>
              <IonItem>
                <IonIcon icon={bulbOutline} slot="start" style={{ color: '#ffc107' }} />
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
                <IonIcon icon={documentTextOutline} slot="start" style={{ color: '#6f42c1' }} />
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
                  <h2>Benötigte Fähigkeiten, Fachwissen, Know How, etc.</h2>
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
              <IonItem>
                <IonIcon icon={locationOutline} slot="start" style={{ color: '#ff9800' }} />
                <IonLabel>
                  <h2>Raum / Ort</h2>
                  <IonInput
                    value={newProject.location}
                    fill="outline"
                    counter={true}
                    maxlength={255}
                    onIonChange={(e) => handleInputChange('location', e.detail.value!)}
                  />
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={peopleCircleOutline} slot="start" style={{ color: '#007bff' }} />
                <IonLabel>
                  <h2>Maximale Teamgröße</h2>
                  <IonInput
                    type="number"
                    value={newProject.max_team_size.toString()}
                    fill="outline"
                    counter={true}
                    maxlength={3}
                    onIonChange={(e) =>
                      handleInputChange(
                        'max_team_size',
                        e.detail.value ? parseInt(e.detail.value, 10) : 0,
                      )
                    }
                  />
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={chatbubblesOutline} slot="start" style={{ color: '#6f42c1' }} />
                <IonLabel>
                  <h2>MS Teams Channel ID</h2>
                  <IonInput
                    type="text"
                    value={newProject.teams_channel_id}
                    fill="outline"
                    counter={true}
                    maxlength={255}
                    onIonChange={(e) => handleInputChange('teams_channel_id', e.detail.value!)}
                  />
                </IonLabel>
              </IonItem>

              {isOrganisator(profile) && (
                <IonItem>
                  <IonIcon icon={playCircleOutline} slot="start" style={{ color: '#6f42c1' }} />
                  <IonLabel>
                    <h2>Status</h2>
                  </IonLabel>
                  <IonSelect
                    value={newProject.status_id}
                    placeholder="Status auswählen"
                    onIonChange={(e) => handleInputChange('status_id', e.detail.value!)}
                  >
                    {Object.entries(ActivityStatusMap).map(([statusId, { name, icon }]) => (
                      <IonSelectOption key={statusId} value={Number(statusId)}>
                        <IonIcon icon={icon} slot="start" style={{ marginRight: '8px' }} />
                        {name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              )}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCol size="12">
          <IonButton expand="block" color="primary" onClick={handleAddProject} disabled={loading}>
            {loading
              ? 'Wird hinzugefügt...'
              : isEditing
                ? 'Änderungen speichern'
                : 'Projekt hinzufügen'}
          </IonButton>
        </IonCol>
      </IonContent>
    </IonPage>
  );
};

export default AddProjectPage;
