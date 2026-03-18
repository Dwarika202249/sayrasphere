import React from 'react';
import { Activity, Clock, Wifi } from 'lucide-react';

interface DeviceHealthCardProps {
  device: {
    _id: string;
    name: string;
    type: string;
    status: 'online' | 'offline';
    lastSeen?: string;
    uptimeSince?: string;
    lastPing?: string;
  };
}

const formatUptime = (uptimeSince?: string): string => {
  if (!uptimeSince) return 'N/A';
  const diff = Date.now() - new Date(uptimeSince).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h ${mins}m`;
};

const formatLastSeen = (lastSeen?: string): string => {
  if (!lastSeen) return 'Never';
  const diff = Date.now() - new Date(lastSeen).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

const DeviceHealthCard: React.FC<DeviceHealthCardProps> = ({ device }) => {
  const isOnline = device.status === 'online';
  const uptime = formatUptime(device.uptimeSince);
  const lastSeen = formatLastSeen(device.lastSeen);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
      
      {/* Status Indicator */}
      <div className={`w-3 h-3 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />

      {/* Device Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{device.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{device.type}</p>
      </div>

      {/* Uptime */}
      <div className="text-center shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <Activity className="w-3 h-3" />
          <span>Uptime</span>
        </div>
        <p className={`text-sm font-bold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
          {isOnline ? uptime : 'Offline'}
        </p>
      </div>

      {/* Last Seen */}
      <div className="text-center shrink-0">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <Clock className="w-3 h-3" />
          <span>Last Seen</span>
        </div>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{lastSeen}</p>
      </div>

      {/* Connection Badge */}
      <div className="shrink-0">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
          <Wifi className="w-3 h-3" />
          {isOnline ? 'Connected' : 'Disconnected'}
        </div>
      </div>

    </div>
  );
};

export default DeviceHealthCard;
