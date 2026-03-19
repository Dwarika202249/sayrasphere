import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { fetchDevices } from '../features/devices/devicesSlice';
import { useSocket } from '../hooks/useSocket';
import DeviceGrid from '../components/dashboard/DeviceGrid';
import DeviceHealthCard from '../components/dashboard/DeviceHealthCard';
import AISummaryCard from '../components/ai/AISummaryCard';
import SimulationToggle from '../components/dashboard/SimulationToggle';
import { Boxes, Activity, Bell, Shield } from 'lucide-react';

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
  const offlineDevices = devices.filter(d => d.status === 'offline').length;
  const alertCount = offlineDevices; // For now, alerts = offline devices

  return (
    <div className="p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-1 uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>SayraSphere Core</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">Command Center</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Hello, <span className="text-indigo-600 font-medium">{user?.name}</span>. Precision monitoring active.</p>
          </div>
          <div className="shrink-0">
            <SimulationToggle />
          </div>
        </header>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Boxes className="w-20 h-20 text-indigo-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Active Nodes</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900 dark:text-white">{devices.length}</p>
              <span className="text-xs font-semibold text-emerald-500">+100% Secure</span>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-20 h-20 text-emerald-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">System Health</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900 dark:text-white">{onlineDevices}</p>
              <span className="text-xs font-semibold text-emerald-500">Live Engines</span>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bell className="w-20 h-20 text-rose-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
                <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">Maintenance Alerts</h3>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-rose-600 dark:text-rose-400">{alertCount}</p>
              <span className="text-xs font-semibold text-rose-500">Urgent Tasks</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Your Devices</h2>
          <DeviceGrid devices={devices} loading={loading} error={error} />
        </div>

        {devices.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mt-4 mb-4 text-gray-800 dark:text-gray-100">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {devices.map(device => (
                  <DeviceHealthCard key={device._id} device={device} />
               ))}
            </div>
          </div>
        )}

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
