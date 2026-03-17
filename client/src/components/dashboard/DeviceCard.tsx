import React from 'react';
import type { Device } from '../../features/devices/devicesSlice';
import { Activity, Thermometer, Lightbulb, Power, Camera, Server } from 'lucide-react';

interface DeviceCardProps {
  device: Device;
}

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'sensor':
      return <Thermometer className="w-6 h-6 text-blue-500" />;
    case 'switch':
      return <Lightbulb className="w-6 h-6 text-yellow-500" />;
    case 'actuator':
      return <Power className="w-6 h-6 text-indigo-500" />;
    case 'camera':
      return <Camera className="w-6 h-6 text-purple-500" />;
    default:
      return <Server className="w-6 h-6 text-gray-500" />;
  }
};

const formatValue = (device: Device) => {
  if (!device.currentValue) return 'No data';

  if (device.type === 'sensor' && device.currentValue.temperature) {
    return `${device.currentValue.temperature}°C / ${device.currentValue.humidity}% RH`;
  }
  
  if (device.type === 'switch' && device.currentValue.state !== undefined) {
    return device.currentValue.state ? 'Turned ON' : 'Turned OFF';
  }

  if (device.type === 'actuator' && device.currentValue.state) {
    return `State: ${device.currentValue.state}`;
  }

  return 'Active';
};

const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const isOnline = device.status === 'online';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {getDeviceIcon(device.type)}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
            {device.type}
          </span>
          <span className="relative flex h-3 w-3">
            {isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={device.name}>
          {device.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
          {device.metadata?.location || 'Unknown Location'}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
          <Activity className="w-4 h-4 mr-2 text-indigo-500" />
          {formatValue(device)}
        </div>
        <div className="text-xs text-gray-400" title={new Date(device.lastPing).toLocaleString()}>
          {new Date(device.lastPing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;
