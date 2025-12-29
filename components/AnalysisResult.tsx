import React from 'react';
import { NutritionAnalysis } from '../types';

interface AnalysisResultProps {
  data: NutritionAnalysis;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      
      {/* Summary Card */}
      <div className="bg-white rounded-[22px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Energy</h2>
          <div className="flex items-center justify-center gap-1 mb-6">
             <span className="text-5xl font-bold text-black tracking-tighter">{data.totalCalories}</span>
             <span className="text-lg font-medium text-gray-400">kcal</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
             <div>
                <span className="block text-sm font-semibold text-[#34C759] mb-1">Protein</span>
                <span className="block text-xl font-bold text-gray-900">{data.totalProtein}g</span>
             </div>
             <div>
                <span className="block text-sm font-semibold text-[#007AFF] mb-1">Carbs</span>
                <span className="block text-xl font-bold text-gray-900">{data.totalCarbs}g</span>
             </div>
             <div>
                <span className="block text-sm font-semibold text-[#FF9500] mb-1">Fat</span>
                <span className="block text-xl font-bold text-gray-900">{data.totalFat}g</span>
             </div>
          </div>
      </div>

      {/* Detected Items List */}
      <div className="bg-white rounded-[22px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
         <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Detected Items</h3>
         </div>
         <div className="divide-y divide-gray-100">
            {data.foodItems.map((item, idx) => (
               <div key={idx} className="px-5 py-4 flex justify-between items-center">
                  <div>
                     <p className="font-semibold text-gray-900">{item.name}</p>
                     <p className="text-sm text-gray-500">{item.portionSize}</p>
                  </div>
                  <span className="font-mono font-medium text-gray-900">{item.calories}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Health Tags & Tips */}
      <div className="space-y-4">
         <div className="flex flex-wrap gap-2 justify-center">
            {data.dietaryTags.map((tag, i) => (
               <span key={i} className="px-3 py-1.5 bg-gray-200/50 text-gray-700 text-sm font-medium rounded-full">
                  {tag}
               </span>
            ))}
         </div>
         
         <div className="bg-gray-50 p-5 rounded-[22px] text-gray-600 text-sm leading-relaxed border border-gray-100">
            <span className="font-bold text-gray-900 block mb-1">💡 Smart Insight</span>
            {data.healthTips}
         </div>
      </div>

    </div>
  );
};