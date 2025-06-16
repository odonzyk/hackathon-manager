export const STORAGE_TOKEN = 'hackathonToken';
export const STORAGE_PROFILE = 'hackathonProfile';
import { archiveOutline, checkmark, closeOutline, playOutline, stopOutline } from 'ionicons/icons';

export const RoleTypes = {
  ADMIN: 1,
  MANAGER: 2,
  USER: 3,
  GUEST: 4,
  NEW: 5,
  DUMMY: 6,
};

export const ProjectStatus = {
  PITCHING: 1,
  ACTIVE: 2,
  ENDED: 3,
  CANCELD: 4,
  ARCHIVED: 5,
};

export type User = {
  id: number;
  email: string;
  name: string;
  role: number;
};

export type Profile = {
  id: number;
  role_id: number;
  name: string;
  email: string;
  is_private_email: boolean;
  telephone: string;
  is_private_telephone: boolean;
  avatar_url: string;
  participate: Participate[];
  initiate: Initiate[];
};

export type Initiator = {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
};

export type Participant = {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
};

export type Participate = {
  id: number;
  user_id: number;
  project_id: number;
  idea: string;
  event_id: number;
  event_name: string;
};
export type Initiate = {
  id: number;
  user_id: number;
  project_id: number;
  idea: string;
  event_id: number;
  event_name: string;
};

export type Project = {
  event_id: number;
  id: number;
  status_id: number;
  idea: string;
  description: string;
  team_name: string;
  goal: string;
  components: string;
  skills: string;
  max_team_size: number;
  teams_channel_id: string;
  initiators: Initiator[];
  participants: Participant[];
};

export type Event = {
  id: number;
  name: string;
  start_time: number;
  end_time: number;
};

export const UserRoleMap: Record<number, { name: string; color: string; emoji: string }> = {
  1: { name: 'Admin', color: '#FF5733', emoji: '👑' }, // Rot für Admin
  2: { name: 'Organizer', color: '#33FF57', emoji: '🎉' }, // Grün für Organisator
  3: { name: 'User', color: '#3498DB', emoji: '👤' }, // Blau für Benutzer
  4: { name: 'Guest', color: '#F1C40F', emoji: '👥' }, // Gelb für Gast
  5: { name: 'New', color: '#9B59B6', emoji: '✨' }, // Lila für Neu
  6: { name: 'Dummy', color: '#95A5A6', emoji: '🤖' }, // Grau für Dummy
};

export const ActivityStatusMap: Record<number, { name: string; icon: any }> = {
  1: { name: 'pitching', icon: playOutline },
  2: { name: 'active', icon: checkmark }, //
  3: { name: 'ended', icon: stopOutline },
  4: { name: 'cancelled', icon: closeOutline },
  5: { name: 'archived', icon: archiveOutline },
};
