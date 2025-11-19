import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface MacroChartProps {
  protein: number;
  fat: number;
  carbs: number;
}

export const MacroChart: React.FC<MacroChartProps> = ({ protein, fat, carbs }) => {
  const data = [
    { name: 'Protein', value: protein, color: '#10b981' }, // emerald-500
    { name: 'Fat', value: fat, color: '#f59e0b' },      // amber-500
    { name: 'Carbs', value: carbs, color: '#3b82f6' },    // blue-500
  ];

  const total = protein + fat + carbs;

  if (total === 0) {
    return <div className="text-center text-gray-400 py-10">No macro data available</div>;
  }

  return (
    <div className="h-[250px] w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}g`, '']}
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              padding: '8px 12px'
            }}
            itemStyle={{ color: '#374151', fontWeight: 600, fontSize: '0.9rem' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value, entry: any) => <span className="text-gray-600 text-sm font-medium ml-1 mr-4">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <span className="text-2xl font-bold text-gray-800">{total}g</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
};