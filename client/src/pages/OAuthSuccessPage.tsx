import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';

const OAuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(false);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      dispatch(
        setCredentials({
          user: { id: 'oauth_user', name: 'Google User', email: '', role: 'user' },
          accessToken,
        })
      );
      
      navigate('/');
    } else if (!accessToken || !refreshToken) {
      // Use set-timeout or similar to avoid synchronous setState in effect warning
      const timer = setTimeout(() => {
        setError(true);
        setTimeout(() => navigate('/login'), 3000);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, navigate, dispatch]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-red-600 mb-4">OAuth Login Failed</h2>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Authenticating...</h2>
      <p className="text-gray-500 dark:text-gray-400">Completing your secure login</p>
    </div>
  );
};

export default OAuthSuccessPage;
