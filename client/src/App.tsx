import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { setLoading, setCredentials, logout } from './features/auth/authSlice';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OAuthSuccessPage from './pages/OAuthSuccessPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AutomationPage from './pages/AutomationPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MapViewPage from './pages/MapViewPage';
import Layout from './components/layout/Layout';
import api from './services/api';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        dispatch(setLoading(false));
        return;
      }

      try {
        // 1. Pre-set the token so the API interceptor can use it
        dispatch(setCredentials({ 
          user: { id: '', name: 'Loading...', email: '', role: '' }, 
          accessToken 
        }));

        // 2. Fetch the real user profile
        const { data: user } = await api.get('/auth/me');
        
        // 3. Update with the real profile
        dispatch(setCredentials({ user, accessToken }));
      } catch (error) {
        console.error('Auth restoration failed:', error);
        localStorage.clear();
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/map" element={<MapViewPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
