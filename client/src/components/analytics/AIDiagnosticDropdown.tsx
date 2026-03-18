import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../app/store';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { setSelectedDevice } from '../../features/telemetry/telemetrySlice';
import { BrainCircuit, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import api from '../../services/api';

const AIDiagnosticDropdown: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: devices } = useSelector((state: RootState) => state.devices);
  const { selectedDeviceId } = useSelector((state: RootState) => state.telemetry);

  interface AISummary {
    type: 'Emergency' | 'Daily' | 'Baseline';
    message: string;
    anomaly?: string;
    timestamp?: string;
  }

  const [summaryData, setSummaryData] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch the pre-computed Cron / Emergency data instantly from the backend
  useEffect(() => {
    const fetchCachedAnalysis = async () => {
      if (!selectedDeviceId) return;
      setLoading(true);
      try {
        const response = await api.get(`/ai/latest-summary/${selectedDeviceId}`);
        setSummaryData(response.data);
      } catch (error) {
        console.error('Failed to fetch AI record', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCachedAnalysis();
  }, [selectedDeviceId]);

  const forceLiveAnalysis = async () => {
    if (!selectedDeviceId) return;
    setLoading(true);
    try {
      const response = await api.post(`/ai/force-summary/${selectedDeviceId}`);
      setSummaryData(response.data);
    } catch (error) {
      console.error('Failed to force refresh AI', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 mb-6 md:mb-8 flex flex-col md:flex-row gap-5 md:gap-8">

      {/* Target Device Dropdown */}
      <div className="w-full md:flex-1">
        <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-500" />
          Sayra Facility Diagnostics Array
        </label>
        <select
          title="Select Device"
          value={selectedDeviceId || ''}
          onChange={(e) => dispatch(setSelectedDevice(e.target.value))}
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base px-3 md:px-4 py-3 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        >
          <option value="" disabled>Select system to sync Telemetry & AI</option>
          {devices.map(d => <option key={d._id} value={d._id}>{d.name} ({d.type})</option>)}
        </select>

        {selectedDeviceId && (
          <button
            onClick={forceLiveAnalysis}
            disabled={loading}
            className="mt-4 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Fetch Current details
          </button>
        )}
      </div>

      {/* AI Readout Terminal */}
      <div className="w-full md:flex-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 md:p-5 border border-dashed border-gray-300 dark:border-gray-700 min-h-35 flex items-center">
        {!selectedDeviceId ? (
          <p className="text-gray-500 text-sm text-center w-full">Awaiting target system selection for AI overview projection.</p>
        ) : loading ? (
          <div className="space-y-3 animate-pulse w-full">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        ) : summaryData ? (
          <div className="w-full space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${summaryData.type === 'Emergency' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'}`}>
                {summaryData.type === 'Emergency' ? <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Emergency Override Active</span> : '24HR System Baseline'}
              </span>
              {summaryData.timestamp && (
                <span className="text-xs text-gray-400 shrink-0">Archived: {new Date(summaryData.timestamp).toLocaleString()}</span>
              )}
            </div>

            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">"{summaryData.message}"</p>

            {summaryData.anomaly && !summaryData.anomaly.includes("Nominal") && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-lg flex gap-2 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{summaryData.anomaly}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-rose-500 text-sm">Failed to connect to AI sub-routines.</p>
        )}
      </div>

    </div>
  );
};

export default AIDiagnosticDropdown;
