import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading } from './features/auth/authSlice';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Simulate initial auth check (check for token in localStorage)
    setTimeout(() => {
      dispatch(setLoading(false));
    }, 500); // Small delay to show the loading spinner at app start
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          {/* Dashboard is wrapped inside ProtectedRoute */}
          <Route path="/" element={<DashboardPage />} />
          {/* Add more protected routes here like /devices, /automation etc */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
