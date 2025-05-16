import { jwtDecode } from 'jwt-decode';
import { STORAGE_PROFILE, STORAGE_TOKEN } from '../types/types';

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const expiryTime = decoded.exp;
    const timeLeft = expiryTime - currentTime;

    return timeLeft <= 0;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export const cleanUpStorage = () => {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_PROFILE);
};

export const getExistingToken = () => {
  const token = localStorage.getItem(STORAGE_TOKEN);

  if (token && !isTokenExpired(token)) return token;
  return null;
};

// export const getUserData = (token: string): User | null => {
//     try {
//         const userData: User = jwt_decode(token);
//         return userData;
//     } catch (error) {
//         console.error("Error decoding token:", error);
//         return null;
//     }
// }
