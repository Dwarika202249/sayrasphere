import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { logout } from '../features/auth/authSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="px-4 py-2 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 font-medium transition-colors"
          >
            Log out
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Devices</h3>
            <p className="text-3xl font-bold text-indigo-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Automations</h3>
            <p className="text-3xl font-bold text-emerald-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Alerts</h3>
            <p className="text-3xl font-bold text-amber-600">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[100]">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Devices</h2>
          <div className="flex items-center justify-center h-full text-gray-400">
            No devices configured yet.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
