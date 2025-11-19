import React from 'react';
import { NutritionAnalysis } from '../types';
import { MacroChart } from './MacroChart';
import { Utensils, Activity, Heart, AlertCircle, Tag, ChevronRight } from 'lucide-react';

interface AnalysisResultProps {
  data: NutritionAnalysis;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  return (
    <div className="animate-fade-in-up space-y-8 w-full">
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Results</h2>
        <div className="flex gap-2">
            {data.dietaryTags?.map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    {tag}
                </span>
            ))}
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Total Calories Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 overflow-hidden relative border border-white">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <div className="p-8 flex flex-col items-center justify-center h-full relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600">
                    <Activity className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">Total Energy</h3>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-6xl font-extrabold text-gray-800 tracking-tight">{data.totalCalories}</span>
                        <span className="text-gray-500 font-semibold text-lg">kcal</span>
                    </div>
                </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl"></div>
        </div>

        {/* Macros Chart Card */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-emerald-900/5 border border-white flex flex-col">
           <h3 className="text-gray-800 font-bold mb-2 flex items-center gap-2">
             Macronutrient Split
           </h3>
           <MacroChart protein={data.totalProtein} fat={data.totalFat} carbs={data.totalCarbs} />
        </div>
      </div>

      {/* Detailed Breakdown & Health Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Food List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl shadow-emerald-900/5 border border-white">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600" />
                Detected Items
            </h3>
            <div className="space-y-3">
                {data.foodItems.map((item, idx) => (
                    <div key={idx} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-200 border border-transparent hover:border-emerald-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                <h4 className="font-bold text-gray-800">{item.name}</h4>
                            </div>
                            <p className="text-sm text-gray-500 pl-4 mt-1">{item.portionSize}</p>
                        </div>
                        <div className="mt-3 sm:mt-0 pl-4 flex items-center gap-6">
                             <div className="text-right">
                                <span className="block font-bold text-lg text-gray-800">{item.calories}</span>
                                <span className="text-xs text-gray-400 font-medium">KCAL</span>
                             </div>
                             <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                             <div className="flex gap-3 text-xs font-medium text-gray-500">
                                <div className="text-center">
                                    <span className="block text-emerald-600 font-bold">{item.protein}g</span>
                                    <span>P</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-amber-500 font-bold">{item.fat}g</span>
                                    <span>F</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-blue-500 font-bold">{item.carbs}g</span>
                                    <span>C</span>
                                </div>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Health Tips */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                    Smart Insights
                </h3>
                <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/10">
                    <p className="leading-relaxed text-slate-100 font-light">
                        {data.healthTips}
                    </p>
                </div>
            </div>
            
            <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex items-center gap-3 text-xs text-slate-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>AI-generated estimation. Consult a professional for medical advice.</p>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </div>

      </div>
    </div>
  );
};