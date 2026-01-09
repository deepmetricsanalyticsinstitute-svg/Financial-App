import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AllocationHistoryItem } from '../types';

interface TrendChartProps {
  history: AllocationHistoryItem[];
}

const TrendChart: React.FC<TrendChartProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4 text-center">
        <p>No payment history recorded yet.</p>
        <p className="text-xs mt-1 text-gray-400">Record a payment in the simulator to see the trend.</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={history}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} 
            stroke="#9ca3af" 
            tick={{fontSize: 12}}
            tickLine={false}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{fontSize: 12}}
            tickLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
             formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
             labelFormatter={(label) => `Month ${label}`}
          />
          <Legend verticalAlign="top" height={36}/>
          <Line 
            type="monotone" 
            dataKey="allocatedInterest" 
            name="Interest Paid" 
            stroke="#F59E0B" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }} 
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="allocatedPrincipal" 
            name="Principal Paid" 
            stroke="#10B981" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
