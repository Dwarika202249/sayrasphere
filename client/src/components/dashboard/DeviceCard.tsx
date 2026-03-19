import React from 'react';
import type { Device } from '../../features/devices/devicesSlice';
import { sendCommandAction, optimisticCommandUpdate } from '../../features/devices/devicesSlice';
import { useAppDispatch } from '../../app/store';
import { Activity, Thermometer, Lightbulb, Power, Camera, Server, Loader2 } from 'lucide-react';
import { Switch } from '../ui/switch';
import toast from 'react-hot-toast';

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
  const dispatch = useAppDispatch();
  const [isCommandPending, setIsCommandPending] = React.useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsCommandPending(true);
    
    // Optimistically update the UI locally so the switch visually flips immediately
    dispatch(optimisticCommandUpdate({ deviceId: device._id, action: 'toggle', value: checked }));

    try {
      await dispatch(sendCommandAction({ deviceId: device._id, action: 'toggle', value: checked })).unwrap();
      toast.success(`${device.name} turned ${checked ? 'ON' : 'OFF'}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to flip ${device.name}: ${message}`);
      // Revert optimistic update on failure by dispatching original reality
      dispatch(optimisticCommandUpdate({ deviceId: device._id, action: 'toggle', value: !checked }));
    } finally {
      setIsCommandPending(false);
    }
  };

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
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={device.name}>
              {device.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {String(device.metadata?.location || 'Unknown Location')}
            </p>
          </div>
          {device.type === 'switch' && (
            <div className="flex items-center space-x-2">
               {isCommandPending && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
               <Switch 
                 checked={device.currentValue?.state === true || device.currentValue?.state === 'true'}
                 onCheckedChange={handleToggle}
                 disabled={isCommandPending}
               />
            </div>
          )}
        </div>
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
