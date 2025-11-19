import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronRight, Target, User } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const calculateTargets = () => {
    // Mifflin-St Jeor Equation
    const { weight, height, age, gender, activityLevel, goal, name } = formData as any;
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += gender === 'male' ? 5 : -161;

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    };
    
    let tdee = bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];

    if (goal === 'lose') tdee -= 500;
    if (goal === 'gain') tdee += 500;

    const calories = Math.round(tdee);
    // Standard macro split: 30% P / 35% F / 35% C
    const protein = Math.round((calories * 0.3) / 4);
    const fat = Math.round((calories * 0.35) / 9);
    const carbs = Math.round((calories * 0.35) / 4);

    const profile: UserProfile = {
      name,
      age,
      weight,
      height,
      gender,
      activityLevel,
      goal,
      calorieTarget: calories,
      proteinTarget: protein,
      fatTarget: fat,
      carbsTarget: carbs,
      onboardingComplete: true
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <Target className="w-6 h-6" />
            </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Let's set up your plan</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">Step {step} of 3</p>

        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                onChange={e => setFormData({...formData, name: e.target.value})}
                value={formData.name || ''}
                placeholder="Enter your name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input 
                        type="number" 
                        className="w-full p-3 bg-slate-50 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                        onChange={e => setFormData({...formData, age: Number(e.target.value)})} 
                        placeholder="25"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select 
                        className="w-full p-3 bg-slate-50 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                        onChange={e => setFormData({...formData, gender: e.target.value as any})} 
                        value={formData.gender}
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
            </div>
            <button 
                onClick={handleNext}
                disabled={!formData.name || !formData.age}
                className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input 
                        type="number" 
                        className="w-full p-3 bg-slate-50 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                        onChange={e => setFormData({...formData, height: Number(e.target.value)})} 
                        placeholder="175"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input 
                        type="number" 
                        className="w-full p-3 bg-slate-50 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                        onChange={e => setFormData({...formData, weight: Number(e.target.value)})} 
                        placeholder="70"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                <select 
                    className="w-full p-3 bg-slate-50 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" 
                    onChange={e => setFormData({...formData, activityLevel: e.target.value as any})} 
                    value={formData.activityLevel}
                >
                    <option value="sedentary">Sedentary (Office Job)</option>
                    <option value="light">Light Exercise (1-2 days)</option>
                    <option value="moderate">Moderate (3-5 days)</option>
                    <option value="active">Active (6-7 days)</option>
                </select>
            </div>
            <button 
                onClick={handleNext}
                disabled={!formData.height || !formData.weight}
                className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:bg-gray-300"
            >
                Next Step
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-3">What is your main goal?</label>
            <div className="space-y-3">
                {['lose', 'maintain', 'gain'].map((g) => (
                    <button
                        key={g}
                        onClick={() => setFormData({...formData, goal: g as any})}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center
                            ${formData.goal === g 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                                : 'border-gray-100 hover:border-emerald-200 text-gray-600'
                            }`}
                    >
                        <span className="capitalize">{g} Weight</span>
                        {formData.goal === g && <div className="w-3 h-3 bg-emerald-500 rounded-full" />}
                    </button>
                ))}
            </div>
            <button 
                onClick={calculateTargets}
                className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
                Create My Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};