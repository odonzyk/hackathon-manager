import { Profile, Project, STORAGE_PROFILE } from '../types/types';
import axios from 'axios';

export enum ResultType {
  SUCCESS = 1,
  ERROR = 2,
}

const resultSuccess = (data: any) => {
  return {
    resultType: ResultType.SUCCESS,
    resultMsg: null,
    data: data,
  };
};
const resultError = (msg: string) => {
  return {
    resultType: ResultType.ERROR,
    resultMsg: msg,
    data: null,
  };
};

export const loadStoredProfile = (): Profile | null => {
  const storedUser = localStorage.getItem(STORAGE_PROFILE);
  let userProfile: Profile | null = null;
  try {
    userProfile = storedUser ? (JSON.parse(storedUser) as Profile) : null;
  } catch (error) {
    console.error('Error on loading profile', error);
  }
  return userProfile;
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
    return resultSuccess(response.data);
  } catch (error) {
    return resultError('Profile konnte nicht geladen werden');
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
    return resultError('Profil konnte nicht aktualisiert werden');
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
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Profile[] | null }> => {
  if (!token) return resultError('token is missing');

  try {
    const response = await axios.get<Profile[]>(`/api/user/list/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return resultSuccess(response.data);
  } catch (error) {
    return resultError('User konnten nicht geladen werden');
  }
};

/* *************************************************** */
/* Projects API                                         */
/* *************************************************** */
export const getProjects = async (
  eventId: number | null,
  token: string | null,
): Promise<{ resultType: ResultType; resultMsg: string | null; data: Project[] | null }> => {
  if (!token || !eventId) return resultError('token or userId is missing');

  try {
    const response = await axios.get<Project[]>(`/api/project/list/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return resultSuccess(response.data);
  } catch (error: any) {
    if (error?.response?.status === 404) return resultSuccess([]);
    return resultError('Projects konnten nicht geladen werden');
  }
};
