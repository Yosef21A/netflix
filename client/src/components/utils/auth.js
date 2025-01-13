// client/src/utils/auth.js
import { useHistory } from 'react-router-dom';
import axios from 'axios';
const TOKEN_KEY = 'token';
const TOKEN_EXPIRATION_KEY = 'token_expiration';

export const setToken = (token) => {
  const expirationTime = new Date().getTime() + 30 * 60 * 1000; // 30 minutes from now
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime);
};

export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expirationTime = localStorage.getItem(TOKEN_EXPIRATION_KEY);

  if (token && expirationTime) {
    if (new Date().getTime() > expirationTime) {
      clearToken();
      return null;
    }
    return token;
  }
  return null;
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRATION_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const useAuthRedirect = () => {
  const history = useHistory();

  const redirectToLogin = () => {
    if (!isAuthenticated()) {
      history.push('/login');
    }
  };

  const redirectToVerification = () => {
    if (isAuthenticated()) {
      history.push('/verif');
    }
  };

  return { redirectToLogin, redirectToVerification };
};

export const setUserId = (id) => {
  localStorage.setItem('userId', id);
};

export const getUserIdFromToken = () => {
  const token = getToken();
  if (token) {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    return decodedToken.userId;
  }
  return null;
};
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
// Clear user ID on logout
export const clearUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem('userId', userId);
  }
  return userId;
};

export const zokomId = ( ) => {
  return localStorage.getItem('userId');
}