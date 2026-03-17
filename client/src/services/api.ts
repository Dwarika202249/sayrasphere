import axios from 'axios';
import { store } from '../app/store';
import { setCredentials, logout } from '../features/auth/authSlice';

// Create base instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    
    // Just as an extra safety check in Phase 0, grab from localStorage if Redux is empty
    const localToken = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else if (localToken) {
      config.headers['Authorization'] = `Bearer ${localToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh Token Rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already retried this original request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Grab refresh token. This should ideally be HTTP-only cookie, 
        // but for Phase 0 we'll use LocalStorage as planned.
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // No refresh token, fully log out
          store.dispatch(logout());
          localStorage.clear();
          return Promise.reject(error);
        }

        // Attempt refresh
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        // Save new tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Update Redux state 
        // Note: we can't easily parse user info from just tokens here without cracking the JWT 
        // or returning user object from /refresh endpoint. For Phase 0 MVP, we just update token.
        const currentUser = store.getState().auth.user;
        if (currentUser) {
          store.dispatch(setCredentials({ user: currentUser, accessToken: data.accessToken }));
        }

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, log user out
        store.dispatch(logout());
        localStorage.clear();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
