import React from 'react';
import type { Device } from '../../features/devices/devicesSlice';
import DeviceCard from './DeviceCard';

interface DeviceGridProps {
  devices: Device[];
  loading: boolean;
  error: string | null;
}

const DeviceGrid: React.FC<DeviceGridProps> = ({ devices, loading, error }) => {
  if (loading && devices.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-48 animate-pulse p-6 border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
            <div className="w-2/3 h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="w-full border-t border-gray-100 dark:border-gray-700 pt-4">
               <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl border border-red-100 dark:border-red-800 text-center">
        <p className="font-medium">Failed to load devices</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-12 rounded-xl text-center border border-gray-100 dark:border-gray-700 shadow-sm border-dashed">
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No devices found</p>
        <p className="text-sm mt-2 text-gray-400">Run the mock simulator or seed the database to see devices.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {devices.map((device) => (
        <DeviceCard key={device._id} device={device} />
      ))}
    </div>
  );
};

export default DeviceGrid;
