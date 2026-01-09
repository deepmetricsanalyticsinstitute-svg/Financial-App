import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AllocationResult } from '../types';

interface AllocationChartProps {
  data: AllocationResult;
}

const AllocationChart: React.FC<AllocationChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Interest Component', value: data.allocatedInterest },
    { name: 'Principal Component', value: data.allocatedPrincipal },
  ];

  const COLORS = ['#F59E0B', '#10B981']; // Amber for Interest, Emerald for Principal

  if (data.paymentAmount === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        Enter a reimbursement amount to see the split.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationChart;
