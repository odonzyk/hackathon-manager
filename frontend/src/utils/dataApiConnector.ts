import { DEMO_RESULTS } from '../types/demoData';
import { Event, Participate, Profile, Project, RoleTypes, STORAGE_PROFILE } from '../types/types';
import axios from 'axios';

export enum ResultType {
  SUCCESS = 1,
  ERROR = 2,
}

const resultSuccess = (data: any) => {
  return {
    resultType: ResultType.SUCCESS,
    resultCode: 200,
    resultMsg: null,
    data: data,
  };
};
const resultError = (msg: string, code: number | null = null) => {
  return {
    resultType: ResultType.ERROR,
    resultMsg: msg,
    resultCode: code ? code : 500,
    data: null,
  };
};

export const loadStoredProfile = (): Profile | null => {
  const storedUser = localStorage.getItem(STORAGE_PROFILE);
  let userProfile: Profile | null = null;
  try {
    userProfile = storedUser ? (JSON.parse(storedUser) as Profile) : null;
    console.log('loadStoredProfile: userProfile: ', userProfile);
  } catch (error) {
    console.error('Error on loading profile', error);
  }
  return userProfile;
};

export const isDemo = (profile: Profile | null): boolean => {
  if (!profile) return true;
  const nonDemoRoles = [RoleTypes.ADMIN, RoleTypes.MANAGER, RoleTypes.USER];
  return !profile || !profile.role_id || !nonDemoRoles.includes(profile.role_id);
};

export const isOrganisator = (profile: Profile | null): boolean => {
  if (!profile) return false;
  const organisatorRoles = [RoleTypes.ADMIN, RoleTypes.MANAGER];
  return organisatorRoles.includes(profile.role_id);
};

/* *************************************************** */
/* User API                                            */
/* *************************************************** */
export const getProfile = async (
  userId: number | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Profile | null }> => {
  if (!token || !userId) return resultError('token or userId is missing');

  try {
    const response = await axios.get<Profile>(`/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('getProfile: response: ', response.data);
    return resultSuccess(response.data);
  } catch (error) {
    return resultError('getProfile: Profil konnte nicht geladen werden');
  }
};

export const putProfile = async (
  profile: Profile | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Profile | null }> => {
  if (!token || !profile) return resultError('Profil oder Token fehlen');

  try {
    const response = await axios.put<Profile>(`/api/user/${profile.id}`, profile, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return resultSuccess(response.data);
    } else {
      return resultError('Profil konnte nicht aktualisiert werden');
    }
  } catch (error) {
    return resultError('putProfile: Profil konnte nicht aktualisiert werden');
  }
};

export const postProfile = async (
  profile: Profile | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Profile | null }> => {
  if (!token || !profile) return resultError('token or profile is missing');

  try {
    const response = await axios.post<Profile>(`/api/user/`, profile, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return resultSuccess(response.data);
    } else {
      return resultError('Proil konnte nicht erstellt werden');
    }
  } catch (error) {
    return resultError('Profil konnte nicht erstellt werden');
  }
};

export const deleteProfile = async (
  profile: Profile | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Profile | null }> => {
  if (!token || !profile) return resultError('token or profile is missing');
  if (isDemo(profile)) return resultError('deleteProfile: Not allowed in demo mode');

  try {
    const response = await axios.delete(`/api/user/${profile.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return resultSuccess(null);
    } else {
      return resultError('Profil konnte nicht gelöscht werden');
    }
  } catch (error) {
    return resultError('Profil konnte nicht gelöscht werden');
  }
};

export const getAllUsers = async (
  profile: Profile | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Profile[] | null }> => {
  if (!token) return resultError('token is missing');
  if (!token || !profile) return resultError('token or profile is missing');
  if (isDemo(profile)) return resultSuccess(DEMO_RESULTS.profiles);

  try {
    const response = await axios.get<Profile[]>(`/api/user/list/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return resultSuccess(response.data);
  } catch (error) {
    return resultError('User konnten nicht geladen werden');
  }
};

export const getUserParticipations = async (
  user_id: number,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Participate[] | null }> => {
  if (!token) return resultError('token is missing');

  try {
    const response = await axios.get<Participate[]>(`/api/user/${user_id}/participate/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return resultSuccess(response.data);
  } catch (error) {
    return resultError('User konnten nicht geladen werden');
  }
};

export const postActivate = async (
  email: string,
  activationCode: string,
): Promise<{
  resultType: ResultType;
  resultCode: number;
  resultMsg: string | null;
  data: { message: string; role: number } | null;
}> => {
  if (!email || !activationCode) return resultError('Email oder Aktivierungscode fehlen');

  try {
    const response = await axios.post(`/api/user/activate`, null, {
      params: { email, ac: activationCode },
    });
    if (response.status === 200) {
      return resultSuccess(response.data);
    } else {
      return resultError('Aktivierung fehlgeschlagen');
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data || 'Unbekannter Fehler';
      return resultError(errorMessage, error.response.status);
    }
    return resultError(
      'Aktivierung fehlgeschlagen. Bitte überprüfen Sie den Link oder kontaktieren Sie uns.',
    );
  }
};

/* *************************************************** */
/* Projects API                                         */
/* *************************************************** */
export const getProjects = async (
  eventId: number | null,
  profile: Profile | null = null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Project[] | null }> => {
  if (!token || !eventId) return resultError('token or eventId is missing');
  if (!profile) return resultError('profile is missing');
  if (isDemo(profile)) return resultSuccess(DEMO_RESULTS.projects[eventId - 1]);

  try {
    const response = await axios.get<Project[]>(`/api/project/list/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return resultSuccess(response.data);
  } catch (error: any) {
    if (error?.response?.status === 404) return resultSuccess([]);
    return resultError('getProjects: Projects konnten nicht geladen werden');
  }
};

export const putProject = async (
  project: Project | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Project | null }> => {
  if (!token || !project) return resultError('Projekt oder Token fehlen');

  try {
    const response = await axios.put<Project>(`/api/project/${project.id}`, project, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return resultSuccess(response.data);
    } else {
      return resultError('Projekt konnte nicht aktualisiert werden');
    }
  } catch (error) {
    return resultError('Projekt konnte nicht aktualisiert werden');
  }
};

export const postProject = async (
  project: Project | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Project | null }> => {
  if (!token || !project) return resultError('token or project is missing');

  try {
    const response = await axios.post<Project>(`/api/project/`, project, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 201) {
      return resultSuccess(response.data);
    } else {
      return resultError('Projekt konnte nicht erstellt werden');
    }
  } catch (error) {
    return resultError('Projekt konnte nicht erstellt werden');
  }
};

/* *************************************************** */
/* Event API                                         */
/* *************************************************** */
export const getEvents = async (
  token: string | null,
  profile: Profile | null = null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Event[] | null }> => {
  if (!token || !profile) return resultError('token or profile is missing');
  if (isDemo(profile)) return resultSuccess(DEMO_RESULTS.events);

  try {
    const response = await axios.get<Event[]>(`/api/event/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return resultSuccess(response.data);
  } catch (error: any) {
    if (error?.response?.status === 404) return resultSuccess([]);
    return resultError('Events konnten nicht geladen werden');
  }
};

// export const getEvent = async (
//   id: number | null,
//   token: string | null,
// ): Promise<{ resultType: ResultType; resultMsg: string | null; data: Event | null }> => {
//   if (!token || !id) return resultError('token or id is missing');

//   try {
//     const response = await axios.get<Event>(`/api/event/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return resultSuccess(response.data);
//   } catch (error: any) {
//     if (error?.response?.status === 404) return resultSuccess(null);
//     return resultError('Event konnten nicht geladen werden');
//   }
// };

/* *************************************************** */
/* Participate                                         */
/* *************************************************** */

export const postParticipant = async (
  project_id: number | null,
  user_id: number | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Project | null }> => {
  if (!token || !project_id || !user_id) return resultError('Projekt, Benutzer oder Token fehlen');

  try {
    const response = await axios.post<Project>(
      `/api/participant`,
      {
        project_id,
        user_id,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.status === 201) {
      return resultSuccess(response.data);
    } else {
      return resultError('Projekt konnte nicht aktualisiert werden');
    }
  } catch (error) {
    return resultError('Projekt konnte nicht aktualisiert werden');
  }
};

export const deleteParticipant = async (
  project_id: number | null,
  user_id: number | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Project | null }> => {
  if (!token || !project_id || !user_id) return resultError('Projekt, Benutzer oder Token fehlen');

  try {
    const response = await axios.delete<Project>(`/api/participant`, {
      data: {
        project_id,
        user_id,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
      return resultSuccess(response.data);
    } else {
      return resultError('Projekt konnte nicht aktualisiert werden');
    }
  } catch (error) {
    return resultError('Projekt konnte nicht aktualisiert werden');
  }
};
