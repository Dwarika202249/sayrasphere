import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { fetchDevices } from '../features/devices/devicesSlice';
import { useSocket } from '../hooks/useSocket';
import DeviceGrid from '../components/dashboard/DeviceGrid';
import AISummaryCard from '../components/ai/AISummaryCard';

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name}</p>
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

        {devices.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-4 mb-4 text-gray-800 dark:text-gray-100">Intelligent Diagnostics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {devices.slice(0, 2).map(device => (
                  <AISummaryCard key={device._id} deviceId={device._id} deviceName={device.name} />
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
