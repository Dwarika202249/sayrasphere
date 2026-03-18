import React from 'react';
import type { AutomationRule } from '../../features/rules/rulesSlice';
import { Switch } from '../ui/switch';
import { useAppDispatch } from '../../app/store';
import { toggleRuleAction, deleteRuleAction } from '../../features/rules/rulesSlice';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RuleListProps {
  rules: AutomationRule[];
}

const RuleList: React.FC<RuleListProps> = ({ rules }) => {
  const dispatch = useAppDispatch();

  const handleToggle = async (ruleId: string, currentEnabled: boolean) => {
    try {
      await dispatch(toggleRuleAction({ ruleId, enabled: !currentEnabled })).unwrap();
      toast.success(`Rule ${!currentEnabled ? 'Enabled' : 'Disabled'}`);
    } catch {
      toast.error("Failed to toggle rule");
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    try {
      await dispatch(deleteRuleAction(ruleId)).unwrap();
      toast.success("Rule Deleted");
    } catch {
      toast.error("Failed to delete rule");
    }
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No automation rules defined yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map(rule => (
        <div key={rule._id} className="bg-white dark:bg-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm gap-4">

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{rule.name}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${rule.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                {rule.enabled ? 'Active' : 'Paused'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-y-2 gap-x-1.5">
              <span className="font-mono bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-gray-500">IF</span>
              <span className="wrap-break-word">{rule.trigger.deviceId?.name || 'Unknown'} <span className="text-indigo-500 font-semibold">{rule.trigger.metric}</span> {rule.trigger.operator} <span className="font-bold">{String(rule.trigger.value)}</span></span>

              <span className="font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold mx-1">THEN</span>
              <span className="wrap-break-word font-medium text-gray-900 dark:text-gray-200">{rule.action.command} <span className="font-bold">{String(rule.action.value)}</span></span>
              <span className="text-gray-400 text-xs">on {rule.action.deviceId?.name || 'Unknown'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 w-full sm:w-auto justify-end">
            <Switch checked={rule.enabled} onCheckedChange={() => handleToggle(rule._id, rule.enabled)} aria-label="Toggle Rule" />
            <button title="Delete Rule" onClick={() => handleDelete(rule._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors ml-2">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

        </div>
      ))}
    </div>
  );
};

export default RuleList;
