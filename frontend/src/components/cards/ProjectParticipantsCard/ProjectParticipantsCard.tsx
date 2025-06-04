import React from 'react';
import './ProjectParticipantsCard.css';
import { Profile, Project } from '../../../types/types';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonLabel, IonList } from '@ionic/react';
import { peopleCircleOutline, personOutline } from 'ionicons/icons';
import JoinProjectButton from '../../buttons/JoinProjectButton/JoinProjectButton';

interface ProjectParticipantsCardProps {
    project: Project;
    profile: Profile | null;
    onJoinClick: () => void;
    onRecjectClick: () => void;
    isLoading?: boolean;
}

const ProjectParticipantsCard: React.FC<ProjectParticipantsCardProps> = ({ project, profile, onJoinClick, onRecjectClick, isLoading }) => {

    return (
        <IonCard className="hackathon-card participant-card">
            <IonCardHeader>
                <IonCardTitle style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Teilnehmer
                </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <IonList>
                    {project.initiators.map((initiator) => (
                        <IonItem key={`initiator-${initiator.id}`}>
                            <IonIcon icon={personOutline} slot="start" style={{ color: '#007bff' }} />
                            <IonLabel>{initiator.name}</IonLabel>
                        </IonItem>
                    ))}
                    {project.participants?.map((participant) => (
                        <IonItem key={`participant-${participant.id}`}>
                            <IonIcon
                                icon={peopleCircleOutline}
                                slot="start"
                                style={{ color: '#17a2b8' }}
                            />
                            <IonLabel>{participant.name}</IonLabel>
                        </IonItem>
                    ))}
                </IonList>
                <div className="join-project-button-container">
                    <JoinProjectButton
                        project={project}
                        profile={profile!}
                        onRejectProject={onRecjectClick}
                        onJoinProject={onJoinClick}
                        disabled={isLoading}
                    />
                </div>
            </IonCardContent>
        </IonCard>
    );
};

export default ProjectParticipantsCard;