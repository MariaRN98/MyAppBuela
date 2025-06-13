import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',  
});

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  // Evitar incluir el token en rutas públicas
  const isAuthEndpoint = [
    '/api/auth/login/',
    '/api/auth/refresh/',
    '/api/auth/register/',
  ].some(path => config.url?.includes(path));

  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


export default api;