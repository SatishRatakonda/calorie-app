import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronRight, Target, User, Activity } from 'lucide-react';

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
    const protein = Math.round((calories * 0.3) / 4);
    const fat = Math.round((calories * 0.35) / 9);
    const carbs = Math.round((calories * 0.35) / 4);

    const profile: UserProfile = {
      name, age, weight, height, gender, activityLevel, goal,
      calorieTarget: calories,
      proteinTarget: protein,
      fatTarget: fat,
      carbsTarget: carbs,
      onboardingComplete: true
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-6 pb-10">
      
      <div className="flex-1 flex flex-col items-center pt-12">
        {step === 1 && (
            <div className="w-full max-w-xs mx-auto animate-fade-in text-center">
                <div className="w-20 h-20 bg-[#007AFF] rounded-[24px] flex items-center justify-center text-white mb-8 mx-auto shadow-lg shadow-blue-500/30">
                    <User className="w-10 h-10" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-black mb-3">Welcome</h1>
                <p className="text-gray-500 text-lg mb-10 leading-relaxed">Let's get to know you to build your perfect health plan.</p>
                
                <div className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Name</label>
                        <input 
                            type="text" 
                            className="w-full p-4 bg-[#F2F2F7] rounded-[16px] text-gray-900 text-lg outline-none focus:ring-2 focus:ring-[#007AFF]/20"
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            value={formData.name || ''}
                            placeholder="John Appleseed"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Age</label>
                            <input type="number" className="w-full p-4 bg-[#F2F2F7] rounded-[16px] text-gray-900 text-lg outline-none" onChange={e => setFormData({...formData, age: Number(e.target.value)})} placeholder="25" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Gender</label>
                            <select className="w-full p-4 bg-[#F2F2F7] rounded-[16px] text-gray-900 text-lg outline-none appearance-none" onChange={e => setFormData({...formData, gender: e.target.value as any})} value={formData.gender}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {step === 2 && (
            <div className="w-full max-w-xs mx-auto animate-fade-in text-center">
                <div className="w-20 h-20 bg-[#34C759] rounded-[24px] flex items-center justify-center text-white mb-8 mx-auto shadow-lg shadow-green-500/30">
                    <Activity className="w-10 h-10" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-black mb-3">Body Stats</h1>
                <p className="text-gray-500 text-lg mb-10">This helps us calculate your metabolic rate.</p>

                <div className="space-y-4 text-left">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Height (cm)</label>
                            <input type="number" className="w-full p-4 bg-[#F2F2F7] rounded-[16px] text-gray-900 text-lg outline-none" onChange={e => setFormData({...formData, height: Number(e.target.value)})} placeholder="175" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Weight (kg)</label>
                            <input type="number" className="w-full p-4 bg-[#F2F2F7] rounded-[16px] text-gray-900 text-lg outline-none" onChange={e => setFormData({...formData, weight: Number(e.target.value)})} placeholder="70" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Activity</label>
                        <select className="w-full p-4 bg-[#F2F2F7] rounded-[16px] text-gray-900 text-lg outline-none appearance-none" onChange={e => setFormData({...formData, activityLevel: e.target.value as any})} value={formData.activityLevel}>
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Light Active</option>
                            <option value="moderate">Moderate</option>
                            <option value="active">Very Active</option>
                        </select>
                    </div>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="w-full max-w-xs mx-auto animate-fade-in text-center">
                <div className="w-20 h-20 bg-[#FF4F00] rounded-[24px] flex items-center justify-center text-white mb-8 mx-auto shadow-lg shadow-orange-500/30">
                    <Target className="w-10 h-10" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-black mb-3">Your Goal</h1>
                <p className="text-gray-500 text-lg mb-10">What do you want to achieve?</p>

                <div className="space-y-3">
                    {['lose', 'maintain', 'gain'].map((g) => (
                        <button
                            key={g}
                            onClick={() => setFormData({...formData, goal: g as any})}
                            className={`w-full p-4 rounded-[16px] font-semibold text-left transition-all border-2 ${
                                formData.goal === g 
                                ? 'border-[#007AFF] bg-blue-50 text-[#007AFF]' 
                                : 'border-transparent bg-[#F2F2F7] text-gray-900'
                            }`}
                        >
                            <span className="capitalize">{g} Weight</span>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="w-full max-w-xs mx-auto">
         <button 
            onClick={step === 3 ? calculateTargets : handleNext}
            disabled={step === 1 ? (!formData.name) : step === 2 ? (!formData.height || !formData.weight) : false}
            className="w-full py-4 bg-[#007AFF] hover:bg-[#0071E3] active:scale-[0.98] transition-all text-white rounded-[16px] font-bold text-[17px] shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {step === 3 ? 'Get Started' : 'Continue'}
         </button>
      </div>
    </div>
  );
};