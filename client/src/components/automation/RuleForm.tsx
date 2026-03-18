import React, { useState } from 'react';
import { useAppDispatch } from '../../app/store';
import { createRuleAction } from '../../features/rules/rulesSlice';
import type { Device } from '../../features/devices/devicesSlice';
import toast from 'react-hot-toast';

interface RuleFormProps {
  devices: Device[];
  onComplete: () => void;
}

const RuleForm: React.FC<RuleFormProps> = ({ devices, onComplete }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  
  // Trigger State
  const [triggerDevice, setTriggerDevice] = useState('');
  const [metric, setMetric] = useState('temperature');
  const [operator, setOperator] = useState('>');
  const [triggerValue, setTriggerValue] = useState('');

  // Action State
  const [actionDevice, setActionDevice] = useState('');
  const [command, setCommand] = useState('toggle');
  const [actionValue, setActionValue] = useState('true');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTriggerDevice = devices.find(d => d._id === triggerDevice);
    const selectedActionDevice = devices.find(d => d._id === actionDevice);

    if (!name || !selectedTriggerDevice || !triggerValue || !selectedActionDevice || !actionValue) {
      toast.error("Please fill out all rule fields");
      return;
    }

    try {
      // Parse boolean equivalents for action value
      let parsedActionValue: unknown = actionValue;
      if (actionValue.toLowerCase() === 'true') parsedActionValue = true;
      if (actionValue.toLowerCase() === 'false') parsedActionValue = false;
      
      // Parse numeric triggers
      const parsedTriggerValue = Number(triggerValue);

      await dispatch(createRuleAction({
        name,
        trigger: {
          deviceId: { _id: selectedTriggerDevice._id, name: selectedTriggerDevice.name, type: selectedTriggerDevice.type },
          metric,
          operator,
          value: isNaN(parsedTriggerValue) ? triggerValue : parsedTriggerValue
        },
        action: {
          deviceId: { _id: selectedActionDevice._id, name: selectedActionDevice.name, type: selectedActionDevice.type },
          command,
          value: parsedActionValue
        },
        enabled: true
      })).unwrap();

      toast.success("Automation Rule saved!");
      onComplete();
    } catch (err: unknown) {
       const message = err instanceof Error ? err.message : String(err);
       toast.error(`Failed to create rule: ${message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rule Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Turn on AC if hot"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">IF (Trigger)</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select title="Select Trigger Device" value={triggerDevice} onChange={(e) => setTriggerDevice(e.target.value)} className="block w-full rounded-md border-gray-300 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white px-3 py-2">
            <option value="">Select Device...</option>
            {devices.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          
          <select title="Select Trigger Metric" value={metric} onChange={(e) => setMetric(e.target.value)} className="block w-full rounded-md border-gray-300 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white px-3 py-2">
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="state">State (true/false)</option>
          </select>

          <select title="Select Trigger Operator" value={operator} onChange={(e) => setOperator(e.target.value)} className="block w-full rounded-md border-gray-300 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white px-3 py-2">
            <option value=">">Greater Than (&gt;)</option>
            <option value="<">Less Than (&lt;)</option>
            <option value="==">Equals (==)</option>
            <option value="!=">Not Equals (!=)</option>
          </select>

          <input 
            type="text" 
            placeholder="Value..." 
            value={triggerValue} 
            onChange={(e) => setTriggerValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white px-3 py-2"
          />
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
        <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-4">THEN (Action)</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select title="Select Target Device" value={actionDevice} onChange={(e) => setActionDevice(e.target.value)} className="block w-full rounded-md border-gray-300 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white px-3 py-2">
            <option value="">Select Target...</option>
            {devices.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>

          <select title="Select Action Command" value={command} onChange={(e) => setCommand(e.target.value)} className="block w-full rounded-md border-gray-300 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white px-3 py-2">
             <option value="toggle">Toggle Power</option>
             <option value="set_temp">Set Temperature</option>
          </select>

          <input 
            type="text" 
            placeholder="Command Value (e.g. true)" 
            value={actionValue} 
            onChange={(e) => setActionValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white px-3 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onComplete} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          Save Rule
        </button>
      </div>
    </form>
  )
}

export default RuleForm;
