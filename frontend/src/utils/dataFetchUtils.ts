import { getEvents, getProjects, getUserParticipations, ResultType } from './dataApiConnector';
import { Event, Profile, Project } from '../types/types';

export const fetchEvents = async (
  token: string | null,
  profile: Profile | null,
  setEvents: (events: Event[]) => void,
  setSelectedEvent: (event: Event | null) => void,
  showToastError: (msg: string) => void,
) => {
  console.log('Fetching Events');
  const result = await getEvents(token, profile);
  if (result.resultType !== ResultType.SUCCESS || result.data === null) {
    showToastError(result.resultMsg ?? 'Error');
    return;
  }
  console.log(`${result.data.length} Events fetched!`);
  setEvents(result.data);
  setSelectedEvent(result.data[1]); // Beispiel: Wähle das zweite Event aus
};

export const fetchProjects = async (
  eventId: number | null,
  profile: Profile | null,
  token: string | null,
  setProjects: (projects: Project[]) => void,
  showToastError: (msg: string) => void,
) => {
  console.log('Fetching Projects');
  const result = await getProjects(eventId, profile, token);
  if (result.resultType !== ResultType.SUCCESS || result.data === null) {
    showToastError(result.resultMsg ?? 'Error');
    return;
  }
  console.log(`Result Data${result.data}`);
  console.log(`${result.data.length} Projects fetched!`);
  setProjects(result.data);
};

export const fetchParticipateList = async (
  token: string | null,
  profile: Profile | null,
  setProfile: (profile: Profile) => void,
  showToastError: (msg: string) => void,
) => {
  console.log('Fetching Participate List');
  if (!profile) {
    showToastError('Profile not loaded');
    return;
  }
  const result = await getUserParticipations(profile.id, token);
  if (result.resultType !== ResultType.SUCCESS || result.data === null) {
    showToastError(result.resultMsg ?? 'Error');
    return;
  }
  console.log(`${result.data.length} Participations fetched!`);
  profile.participate = result.data;
  setProfile(profile);
};
