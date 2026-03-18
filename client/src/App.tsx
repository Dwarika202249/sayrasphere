import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { setLoading, setCredentials } from './features/auth/authSlice';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OAuthSuccessPage from './pages/OAuthSuccessPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AutomationPage from './pages/AutomationPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for tokens
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // In a real app we would hit a `/api/auth/me` to get the latest user profile
      // But for Phase 0, we can decode the token or just trust the local storage
      dispatch(
        setCredentials({
          user: { id: 'unknown', name: 'User', email: '', role: 'user' },
          accessToken,
        })
      );
    }
    dispatch(setLoading(false));
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
          {/* Dashboard is wrapped inside ProtectedRoute */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/automation" element={<AutomationPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
