import React, { useState, useRef } from 'react';
import { UserProfile, DailyLog, NutritionAnalysis } from '../types';
import { Droplets, Flame, ChevronRight, Trash2 } from 'lucide-react';
import { MacroChart } from './MacroChart';

interface DashboardProps {
  profile: UserProfile;
  todayLog: DailyLog;
  onAddWater: (amount: number) => void;
  onLogFood: () => void;
  onDeleteMeal: (id: string) => void;
}

const SwipeableMealRow: React.FC<{ meal: NutritionAnalysis; onDelete: (id: string) => void }> = ({ meal, onDelete }) => {
    const [translateX, setTranslateX] = useState(0);
    const startX = useRef<number | null>(null);
    const currentX = useRef<number | null>(null);
    const isDragging = useRef(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        currentX.current = e.touches[0].clientX;
        isDragging.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!startX.current || !isDragging.current) return;
        
        const touchX = e.touches[0].clientX;
        const diff = touchX - startX.current;
        
        // Only allow swiping left (negative value), cap at -100
        if (diff < 0 && diff > -120) {
            setTranslateX(diff);
        }
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
        startX.current = null;
        currentX.current = null;

        // Threshold to snap open
        if (translateX < -50) {
            setTranslateX(-80); // Snap to show delete button
        } else {
            setTranslateX(0); // Snap back
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(meal.id);
        setTranslateX(0);
    };

    return (
        <div className="relative overflow-hidden">
            {/* Background Delete Button */}
            <div className="absolute top-0 bottom-0 right-0 w-[80px] bg-[#FF3B30] flex items-center justify-center z-0">
                <button onClick={handleDelete} className="w-full h-full flex items-center justify-center text-white">
                    <Trash2 className="w-6 h-6" />
                </button>
            </div>

            {/* Swipeable Content */}
            <div 
                className="relative bg-white z-10 transition-transform duration-200 ease-out flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100"
                style={{ transform: `translateX(${translateX}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="flex items-center gap-4 pointer-events-none select-none">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-xl">
                        {meal.mealType === 'snack' ? '☕️' : '🍽️'}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{meal.foodItems[0]?.name}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {meal.totalCalories} kcal
                        </p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 pointer-events-none" />
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ profile, todayLog, onAddWater, onLogFood, onDeleteMeal }) => {
  const consumedCalories = todayLog.meals.reduce((acc, meal) => acc + meal.totalCalories, 0);
  const remainingCalories = profile.calorieTarget - consumedCalories;
  
  const consumedProtein = todayLog.meals.reduce((acc, m) => acc + m.totalProtein, 0);
  const consumedCarbs = todayLog.meals.reduce((acc, m) => acc + m.totalCarbs, 0);
  const consumedFat = todayLog.meals.reduce((acc, m) => acc + m.totalFat, 0);

  return (
    <div className="space-y-5 animate-fade-in pb-24">
        
        {/* Hero Activity Card */}
        <div className="bg-white rounded-[22px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Activity</h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">TODAY</span>
            </div>
            
            <div className="flex items-center gap-8">
                {/* Ring Chart */}
                <div className="relative w-32 h-32 shrink-0">
                    <MacroChart 
                        protein={consumedProtein} 
                        fat={consumedFat} 
                        carbs={consumedCarbs} 
                        total={consumedCalories}
                        target={profile.calorieTarget}
                    />
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-baseline">
                         <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#FF4F00]"></div>
                             <span className="text-sm font-medium text-gray-600">Move</span>
                         </div>
                         <span className="text-sm font-mono font-semibold">{consumedCalories} <span className="text-gray-400 text-xs">/ {profile.calorieTarget}</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                         <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#34C759]"></div>
                             <span className="text-sm font-medium text-gray-600">Protein</span>
                         </div>
                         <span className="text-sm font-mono font-semibold">{consumedProtein} <span className="text-gray-400 text-xs">/ {profile.proteinTarget}g</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                         <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF]"></div>
                             <span className="text-sm font-medium text-gray-600">Carbs</span>
                         </div>
                         <span className="text-sm font-mono font-semibold">{consumedCarbs} <span className="text-gray-400 text-xs">/ {profile.carbsTarget}g</span></span>
                    </div>
                </div>
            </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
            {/* Water Card */}
            <div className="bg-white rounded-[22px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between h-40 relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                    <div className="flex items-center gap-2">
                         <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[#007AFF]">
                             <Droplets className="w-4 h-4 fill-current" />
                         </div>
                         <span className="font-bold text-[#007AFF] text-sm">Water</span>
                    </div>
                    <button onClick={() => onAddWater(250)} className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all">
                        <span className="text-lg font-medium leading-none mb-0.5">+</span>
                    </button>
                </div>
                <div className="z-10">
                    <span className="text-3xl font-bold tracking-tighter text-gray-900">{todayLog.waterIntake}<span className="text-lg text-gray-400 font-medium ml-1">ml</span></span>
                </div>
                
                {/* Background Wave Decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-blue-50 opacity-50 rounded-b-[22px]">
                    <svg viewBox="0 0 1440 320" className="w-full h-full absolute bottom-0 opacity-30 fill-blue-400">
                       <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </div>

            {/* Remaining Cals Card */}
            <div className="bg-white rounded-[22px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between h-40">
                <div className="flex items-center gap-2">
                     <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-[#FF4F00]">
                         <Flame className="w-4 h-4 fill-current" />
                     </div>
                     <span className="font-bold text-[#FF4F00] text-sm">Energy</span>
                </div>
                <div>
                    <span className="text-3xl font-bold tracking-tighter text-gray-900">{Math.max(0, remainingCalories)}</span>
                    <p className="text-xs font-medium text-gray-400 mt-1">KCAL LEFT</p>
                </div>
            </div>
        </div>

        {/* Meals List */}
        <div>
            <div className="flex justify-between items-end mb-3 px-1">
                <h3 className="text-xl font-bold tracking-tight text-gray-900">History</h3>
                <button className="text-[#007AFF] text-sm font-medium">Show All</button>
            </div>
            <div className="bg-white rounded-[22px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                {todayLog.meals.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-400 text-sm">No meals recorded today.</p>
                        <button onClick={onLogFood} className="mt-4 text-[#007AFF] font-medium text-sm">Log your first meal</button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {todayLog.meals.map((meal) => (
                            <SwipeableMealRow key={meal.id} meal={meal} onDelete={onDeleteMeal} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};