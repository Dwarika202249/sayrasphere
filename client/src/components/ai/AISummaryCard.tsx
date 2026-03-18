import React, { useState } from 'react';
import { BrainCircuit, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';

interface AISummaryCardProps {
  deviceId: string;
  deviceName: string;
}

const AISummaryCard: React.FC<AISummaryCardProps> = ({ deviceId, deviceName }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [anomaly, setAnomaly] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      // First try to read cached Cron/Emergency data (instant)
      const cachedRes = await api.get(`/ai/latest-summary/${deviceId}`);
      if (cachedRes.data.timestamp) {
        setSummary(cachedRes.data.message);
        setAnomaly(cachedRes.data.anomaly);
      } else {
        // No cached data exists yet — force a live generation
        const liveRes = await api.post(`/ai/force-summary/${deviceId}`);
        setSummary(liveRes.data.message);
        setAnomaly(liveRes.data.anomaly);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights', error);
      setSummary("Failed to generate AI summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-900/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-500" />
          Sayra's Analysis: {deviceName}
        </h3>
        <button 
          onClick={fetchAIInsights} 
          disabled={loading}
          className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors disabled:opacity-50"
          title="Analyze recent telemetry"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {!summary && !loading && (
        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
          Click the refresh button to generate an AI diagnostic run on this device's recent data.
        </p>
      )}

      {loading && (
        <div className="space-y-2 animate-pulse">
           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
           <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      )}

      {summary && !loading && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-800 dark:text-gray-200 leading-relaxed border border-gray-100 dark:border-gray-700">
             {summary}
          </div>
          
          {anomaly && !anomaly.includes("Nominal") && !anomaly.includes("Failed") && (
             <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-lg flex gap-3 text-sm text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{anomaly}</p>
             </div>
          )}
          
          {anomaly && anomaly.includes("Nominal") && (
             <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs text-emerald-800 dark:text-emerald-400 font-medium text-center">
                ✓ System Nominal: No Maintenance Predicted
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISummaryCard;
