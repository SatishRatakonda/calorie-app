import React from 'react';
import { UserProfile, DailyLog } from '../types';
import { Droplets, Flame, Plus, Footprints } from 'lucide-react';
import { MacroChart } from './MacroChart';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  profile: UserProfile;
  todayLog: DailyLog;
  onAddWater: (amount: number) => void;
  onLogFood: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, todayLog, onAddWater, onLogFood }) => {
  const consumedCalories = todayLog.meals.reduce((acc, meal) => acc + meal.totalCalories, 0);
  const remainingCalories = profile.calorieTarget - consumedCalories;
  const progress = Math.min(100, (consumedCalories / profile.calorieTarget) * 100);
  
  // Calculate Macros
  const consumedProtein = todayLog.meals.reduce((acc, m) => acc + m.totalProtein, 0);
  const consumedCarbs = todayLog.meals.reduce((acc, m) => acc + m.totalCarbs, 0);
  const consumedFat = todayLog.meals.reduce((acc, m) => acc + m.totalFat, 0);

  const pieData = [
      { value: consumedCalories, color: '#10b981' },
      { value: Math.max(0, remainingCalories), color: '#e2e8f0' }
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <p className="text-gray-500 text-sm font-medium">Welcome back,</p>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                {profile.name.charAt(0)}
            </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 p-6 border border-emerald-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
                {/* Circular Progress */}
                <div className="w-40 h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={75}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={10}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <Flame className="w-6 h-6 text-emerald-500 mb-1" fill="currentColor" />
                        <span className="text-2xl font-bold text-gray-800">{Math.max(0, remainingCalories)}</span>
                        <span className="text-xs text-gray-400 font-medium uppercase">Left</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Protein</span>
                            <span className="font-bold text-gray-700">{consumedProtein} / {profile.proteinTarget}g</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (consumedProtein / profile.proteinTarget) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Carbs</span>
                            <span className="font-bold text-gray-700">{consumedCarbs} / {profile.carbsTarget}g</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (consumedCarbs / profile.carbsTarget) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Fat</span>
                            <span className="font-bold text-gray-700">{consumedFat} / {profile.fatTarget}g</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (consumedFat / profile.fatTarget) * 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
            <button onClick={onLogFood} className="p-4 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex flex-col items-start justify-between h-32 group relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Plus className="w-6 h-6" />
                </div>
                <div>
                    <span className="block font-bold text-lg">Log Food</span>
                    <span className="text-emerald-100 text-xs">Camera / Voice</span>
                </div>
            </button>

            <div className="p-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                        <Droplets className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl text-gray-800">{todayLog.waterIntake}ml</span>
                </div>
                <div>
                    <span className="block text-sm text-gray-500 mb-2">Hydration</span>
                    <button 
                        onClick={() => onAddWater(250)}
                        className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition-colors"
                    >
                        +250ml Cup
                    </button>
                </div>
            </div>
        </div>

        {/* Today's Meals */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-100/50">
            <h3 className="font-bold text-gray-800 mb-4">Today's Meals</h3>
            {todayLog.meals.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <p>No meals logged yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {todayLog.meals.map((meal) => (
                        <div key={meal.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">
                                    🥗
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{meal.foodItems[0]?.name}</p>
                                    <p className="text-xs text-gray-500">{new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                            <span className="font-bold text-emerald-600 text-sm">{meal.totalCalories} kcal</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
