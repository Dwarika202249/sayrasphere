import React from 'react';
import { useAppDispatch } from '../../app/store';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { setDateRange } from '../../features/telemetry/telemetrySlice';
import TimeSeriesChart from './TimeSeriesChart';
import { Download, Clock, LineChart } from 'lucide-react';
import toast from 'react-hot-toast';

const TelemetryViewer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: telemetry, loading, dateRange, selectedDeviceId } = useSelector((state: RootState) => state.telemetry);

  const handleExportCSV = () => {
    if (!telemetry || telemetry.length === 0) {
      toast.error('No data to export');
      return;
    }

    const metricKeys = new Set<string>();
    telemetry.forEach(i => Object.keys(i.metrics).forEach(k => metricKeys.add(k)));
    const keys = Array.from(metricKeys);

    let csvContent = `Timestamp,${keys.join(',')}\n`;

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
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col gap-4 md:flex-row md:gap-6 mb-6 md:justify-between md:items-end">
        
        {/* Date Range Selector */}
        <div className="w-full md:flex-1 md:max-w-md">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Range Filter</label>
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            {[
              { value: '24h', label: 'Last 24h' },
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' }
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => dispatch(setDateRange(opt.value as '24h' | '7d' | '30d'))}
                className={`flex-1 flex items-center justify-center space-x-1 py-2 text-sm font-medium rounded-md transition-all ${dateRange === opt.value ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <Clock className="w-4 h-4" />
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Download Button */}
        <div>
          <button
            onClick={handleExportCSV}
            disabled={!selectedDeviceId || telemetry.length === 0}
            className="w-full md:w-auto flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-5 py-3 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="h-52 md:h-96 w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-4">
             <LineChart className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mb-4" />
             <p className="text-gray-500 font-medium text-sm md:text-base text-center">Select a device from the AI panel above to begin plotting telemetry data.</p>
          </div>
        ) : (
          <TimeSeriesChart data={telemetry} />
        )}
      </div>

    </div>
  );
};

export default TelemetryViewer;
