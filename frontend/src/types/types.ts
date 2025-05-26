export const STORAGE_TOKEN = 'hackathonToken';
export const STORAGE_PROFILE = 'hackathonProfile';
import { archiveOutline, checkmark, closeOutline, playOutline, stopOutline } from 'ionicons/icons';

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
};

export type Initiator = {
  id: number;
  name: string;
  avatar_url: string;
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
  initiators: Initiator[];
};

export type Event = {
  id: number;
  name: string;
  start_time: number;
  end_time: number;
};

export const UserRoleMap: Record<number, { name: string; color: string; emoji: string }> = {
  1: { name: 'Admin', color: '#FF5733', emoji: '👑' }, // Rot für Admin
  2: { name: 'User', color: '#3498DB', emoji: '👤' }, // Blau für User
};

export const ActivityStatusMap: Record<number, { name: string; icon: any }> = {
  1: { name: 'pitching', icon: playOutline },
  2: { name: 'active', icon: checkmark }, //
  3: { name: 'ended', icon: stopOutline },
  4: { name: 'cancelled', icon: closeOutline },
  5: { name: 'archived', icon: archiveOutline },
};
