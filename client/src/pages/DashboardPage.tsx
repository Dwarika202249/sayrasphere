import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../app/store';
import { logout } from '../features/auth/authSlice';
import { fetchDevices } from '../features/devices/devicesSlice';
import { useSocket } from '../hooks/useSocket';
import DeviceGrid from '../components/dashboard/DeviceGrid';

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: devices, loading, error } = useSelector((state: RootState) => state.devices);

  // Initialize Socket.IO connection
  useSocket();

  // Fetch initial device layout
  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  const onlineDevices = devices.filter(d => d.status === 'online').length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex space-x-3">
             <button
               onClick={() => navigate('/automation')}
               className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 font-medium transition-colors"
             >
               Automations
             </button>
             <button
               onClick={() => dispatch(logout())}
               className="px-4 py-2 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 font-medium transition-colors"
             >
               Log out
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Total Devices</h3>
            <p className="text-3xl font-bold text-indigo-600">{devices.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Online Engines</h3>
            <p className="text-3xl font-bold text-emerald-600">{onlineDevices}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Recent Alerts</h3>
            <p className="text-3xl font-bold text-amber-600">0</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Devices</h2>
          <DeviceGrid devices={devices} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
