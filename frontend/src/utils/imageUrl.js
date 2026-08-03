const API_URL = import.meta.env.VITE_API_URL || 'https://campeonatos-backend.onrender.com';

export const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
