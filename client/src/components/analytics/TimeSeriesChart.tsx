import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TelemetryData } from '../../features/telemetry/telemetrySlice';

interface TimeSeriesChartProps {
  data: TelemetryData[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data }) => {
  // Transform data for recharts
  const chartData = data.map(item => {
    const formattedData: Record<string, unknown> = {
      time: new Date(item.timestamp).toLocaleString(),
      ...item.metrics
    };
    return formattedData;
  });

  // Dynamically find all unique metric keys to render lines for
  const keys = new Set<string>();
  data.forEach(item => {
     Object.keys(item.metrics).forEach(k => keys.add(k));
  });

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (data.length === 0) {
    return (
      <div className="h-96 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
         <p className="text-gray-500 font-medium">No telemetry data found for this time range.</p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full min-h-96 min-w-75 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
             dataKey="time" 
             tick={{ fontSize: 12, fill: '#6b7280' }} 
             tickMargin={10} 
             axisLine={false}
             minTickGap={30}
          />
          <YAxis 
             tick={{ fontSize: 12, fill: '#6b7280' }} 
             axisLine={false} 
             tickLine={false}
          />
          <Tooltip 
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: '4px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {Array.from(keys).map((key, index) => (
             <Line 
               key={key} 
               type="monotone" 
               dataKey={key} 
               stroke={colors[index % colors.length]} 
               strokeWidth={2} 
               dot={false}
               activeDot={{ r: 6, strokeWidth: 0 }}
             />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;
