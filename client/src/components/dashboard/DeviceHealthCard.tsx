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
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
      
      {/* Top Row: Status dot + Name + Connection Badge */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{device.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{device.type}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0 ${isOnline ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
          <Wifi className="w-3 h-3" />
          <span className="hidden sm:inline">{isOnline ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Bottom Row: Stats */}
      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pl-0 sm:pl-6">
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
          <Activity className="w-3 h-3 shrink-0" />
          <span>Uptime:</span>
          <span className={`font-bold ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
            {isOnline ? uptime : 'Offline'}
          </span>
        </div>
        <div className="hidden sm:block w-px h-4 bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 shrink-0" />
          <span>Seen:</span>
          <span className="font-bold text-gray-700 dark:text-gray-300">{lastSeen}</span>
        </div>
      </div>

    </div>
  );
};

export default DeviceHealthCard;
