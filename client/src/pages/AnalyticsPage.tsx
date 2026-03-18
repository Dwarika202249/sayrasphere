import React, { useEffect } from 'react';
import { useAppDispatch } from '../app/store';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { fetchDevices } from '../features/devices/devicesSlice';
import { fetchTelemetry, setDateRange, setSelectedDevice } from '../features/telemetry/telemetrySlice';
import TimeSeriesChart from '../components/analytics/TimeSeriesChart';
import { LineChart, Download, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: devices } = useSelector((state: RootState) => state.devices);
  const { items: telemetry, loading, dateRange, selectedDeviceId } = useSelector((state: RootState) => state.telemetry);

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  // Refetch telemetry when device or range changes
  useEffect(() => {
    if (selectedDeviceId) {
       dispatch(fetchTelemetry({ deviceId: selectedDeviceId, range: dateRange }));
    }
  }, [dispatch, selectedDeviceId, dateRange]);

  const handleExportCSV = () => {
    if (!telemetry || telemetry.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Extract all unique metric keys
    const metricKeys = new Set<string>();
    telemetry.forEach(i => Object.keys(i.metrics).forEach(k => metricKeys.add(k)));
    const keys = Array.from(metricKeys);

    // Build header row
    let csvContent = `Timestamp,${keys.join(',')}\n`;

    // Map each row
    telemetry.forEach(item => {
      const time = new Date(item.timestamp).toISOString();
      const row = keys.map(k => item.metrics[k] !== undefined ? item.metrics[k] : '').join(',');
      csvContent += `${time},${row}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `telemetry_export_${selectedDeviceId}_${dateRange}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
             <LineChart className="w-8 h-8 text-indigo-500" />
             <span>Analytics & History</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Visualize device telemetry and export historical sensor data.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
         <div className="flex flex-col md:flex-row gap-6 mb-6">
            
            {/* Device Selector */}
            <div className="flex-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Device</label>
              <select 
                 title="Select Device"
                 value={selectedDeviceId || ''} 
                 onChange={(e) => dispatch(setSelectedDevice(e.target.value))} 
                 className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-3 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              >
                <option value="" disabled>Select a device to view history...</option>
                {devices.map(d => <option key={d._id} value={d._id}>{d.name} ({d.type})</option>)}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Range</label>
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                {[
                  { value: '24h', label: 'Last 24h' },
                  { value: '7d', label: '7 Days' },
                  { value: '30d', label: '30 Days' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => dispatch(setDateRange(opt.value as any))}
                    className={`flex-1 flex items-center justify-center space-x-1 py-2 text-sm font-medium rounded-md transition-all ${dateRange === opt.value ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Download Button */}
            <div className="flex items-end">
              <button
                onClick={handleExportCSV}
                disabled={!selectedDeviceId || telemetry.length === 0}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-5 py-3 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span>Export CSV</span>
              </button>
            </div>

         </div>

         {/* Chart Area */}
         <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}
            
            {!selectedDeviceId ? (
              <div className="h-96 w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                 <LineChart className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                 <p className="text-gray-500 font-medium">Select a device from the dropdown to begin plotting analytics.</p>
              </div>
            ) : (
              <TimeSeriesChart data={telemetry} />
            )}
         </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
