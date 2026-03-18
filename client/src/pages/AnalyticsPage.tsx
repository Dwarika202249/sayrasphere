import React, { useEffect } from 'react';
import { useAppDispatch } from '../app/store';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { fetchDevices } from '../features/devices/devicesSlice';
import { fetchTelemetry } from '../features/telemetry/telemetrySlice';
import AIDiagnosticDropdown from '../components/analytics/AIDiagnosticDropdown';
import TelemetryViewer from '../components/analytics/TelemetryViewer';
import { LineChart } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedDeviceId, dateRange } = useSelector((state: RootState) => state.telemetry);

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  // Refetch telemetry when device or range changes
  useEffect(() => {
    if (selectedDeviceId) {
       dispatch(fetchTelemetry({ deviceId: selectedDeviceId, range: dateRange }));
    }
  }, [dispatch, selectedDeviceId, dateRange]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
             <LineChart className="w-8 h-8 text-indigo-500" />
             <span>Analytics & History</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            AI-powered facility diagnostics paired with real-time telemetry visualization.
          </p>
        </div>
      </div>

      {/* Phase 5.5: AI Diagnostic Dropdown (device selector + cached Groq summary) */}
      <AIDiagnosticDropdown />

      {/* Componentized Telemetry Viewer (date range, CSV export, chart) */}
      <TelemetryViewer />

    </div>
  );
};

export default AnalyticsPage;
