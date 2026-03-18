import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { Play, Square, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SimulationToggle = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only show for admins or test user
  const isAllowed = user?.email === 'test@sayrasphere.com' || user?.email?.includes('admin');

  if (!isAllowed) return null;

  const handleToggle = async () => {
    setLoading(true);
    const action = isSimulating ? 'STOP' : 'START';
    
    try {
      await api.post('/devices/simulate', { action });
      setIsSimulating(!isSimulating);
      toast.success(action === 'START' ? 'Cloud Simulation Started' : 'Cloud Simulation Stopped');
    } catch {
      toast.error('Failed to toggle simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
        isSimulating 
          ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' 
          : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isSimulating ? (
        <Square className="w-3.5 h-3.5 fill-current" />
      ) : (
        <Play className="w-3.5 h-3.5 fill-current" />
      )}
      <span>{isSimulating ? 'Stop Simulation' : 'Start Simulation'}</span>
    </button>
  );
};

export default SimulationToggle;
