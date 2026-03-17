import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../app/store';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { fetchRules } from '../features/rules/rulesSlice';
import { fetchDevices } from '../features/devices/devicesSlice';
import RuleList from '../components/automation/RuleList';
import RuleForm from '../components/automation/RuleForm';
import { Plus, Zap } from 'lucide-react';

const AutomationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: rules, loading: rulesLoading } = useSelector((state: RootState) => state.rules);
  const { items: devices } = useSelector((state: RootState) => state.devices);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchRules());
    dispatch(fetchDevices()); // Needed for the dropdowns
  }, [dispatch]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
            <Zap className="w-8 h-8 text-indigo-500" />
            <span>Automation Engine</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create automated "If This, Then That" rules for your smart devices.
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Rule</span>
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Create Automation Rule</h2>
          <RuleForm devices={devices} onComplete={() => setShowForm(false)} />
        </div>
      ) : null}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Active Rules</h2>
        {rulesLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>)}
          </div>
        ) : (
          <RuleList rules={rules} />
        )}
      </div>
    </div>
  );
};

export default AutomationPage;
