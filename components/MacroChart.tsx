import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MacroChartProps {
  protein: number;
  fat: number;
  carbs: number;
  total: number;
  target: number;
}

export const MacroChart: React.FC<MacroChartProps> = ({ protein, fat, carbs, total, target }) => {
  // Apple Activity Ring Colors
  const COLORS = {
      move: '#FF4F00', // Orange/Red
      protein: '#34C759', // Green
      carbs: '#007AFF', // Blue
      empty: '#E5E5EA'  // System Gray 5
  };

  // Calculate percentages for the rings
  // We are visually simulating the 3 rings by nesting Pie charts
  // Outer: Calories (Move)
  // Middle: Protein (Exercise)
  // Inner: Carbs (Stand) -> Just using this for visual mapping of macros
  
  const movePct = Math.min(100, (total / target) * 100);
  const moveData = [
      { value: total, color: COLORS.move },
      { value: Math.max(0, target - total), color: COLORS.empty }
  ];
  
  return (
    <div className="w-full h-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={moveData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={58}
                    startAngle={90}
                    endAngle={-270}
                    cornerRadius={20}
                    stroke="none"
                >
                    {moveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-[#FF4F00] uppercase tracking-wide">Cals</span>
             </div>
        </div>
    </div>
  );
};