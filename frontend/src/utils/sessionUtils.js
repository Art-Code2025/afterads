// Session utilities for guest users
export const generateSessionId = () => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const clearSessionId = () => {
  localStorage.removeItem('sessionId');
};

export const isGuest = () => {
  const userData = localStorage.getItem('user');
  return !userData;
};

export const getUserId = () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
}; 