export const getToken = () => localStorage.getItem('token');

export const decodeUserSync = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const base64Payload = token.split('.')[1];
    return JSON.parse(atob(base64Payload));
  } catch {
    return null;
  }
};
