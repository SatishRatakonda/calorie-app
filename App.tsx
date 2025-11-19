import React, { useState, useEffect } from 'react';
import { InputForm } from './components/InputForm';
import { AnalysisResult } from './components/AnalysisResult';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { AICoach } from './components/AICoach';
import { analyzeFood } from './services/gemini';
import { NutritionAnalysis, AppStatus, UserProfile, DailyLog, ChatMessage } from './types';
import { Leaf, LayoutDashboard, MessageSquare, User, PlusCircle, ScanBarcode } from 'lucide-react';

const STORAGE_KEY = 'caloriesnap_data_v2';

type ViewState = 'ONBOARDING' | 'DASHBOARD' | 'LOG_FOOD' | 'RESULT' | 'COACH' | 'PROFILE';

interface AppState {
  profile: UserProfile | null;
  dailyLogs: Record<string, DailyLog>; // key by YYYY-MM-DD
  chatHistory: ChatMessage[];
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('ONBOARDING');
  const [state, setState] = useState<AppState>({
    profile: null,
    dailyLogs: {},
    chatHistory: []
  });
  
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [currentResult, setCurrentResult] = useState<NutritionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
        if (parsed.profile?.onboardingComplete) {
          setView('DASHBOARD');
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    } else {
        // No data, stay on onboarding
    }
  }, []);

  // Save Data
  useEffect(() => {
    if (state.profile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const getTodayLog = (): DailyLog => {
    const today = new Date().toISOString().split('T')[0];
    return state.dailyLogs[today] || { date: today, meals: [], waterIntake: 0 };
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
    setView('DASHBOARD');
  };

  const handleLogFood = async (text: string, file: File | null) => {
    setStatus(AppStatus.ANALYZING);
    setError(null);

    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (file) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        mimeType = file.type;
      }

      // Context for better AI analysis
      const todayLog = getTodayLog();
      const context = `User wants to ${state.profile?.goal} weight. Consumed today: ${todayLog.meals.reduce((a,b)=>a+b.totalCalories,0)} kcal.`;

      const result = await analyzeFood(text, imageBase64, mimeType, context);
      setCurrentResult(result);
      setStatus(AppStatus.SUCCESS);
      setView('RESULT');
    } catch (err: any) {
      setStatus(AppStatus.ERROR);
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  const confirmFoodLog = () => {
    if (!currentResult) return;
    const today = new Date().toISOString().split('T')[0];
    const currentLog = getTodayLog();
    
    const updatedLog = {
        ...currentLog,
        meals: [currentResult, ...currentLog.meals]
    };

    setState(prev => ({
        ...prev,
        dailyLogs: {
            ...prev.dailyLogs,
            [today]: updatedLog
        }
    }));
    setCurrentResult(null);
    setStatus(AppStatus.IDLE);
    setView('DASHBOARD');
  };

  const updateWater = (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const currentLog = getTodayLog();
    setState(prev => ({
        ...prev,
        dailyLogs: {
            ...prev.dailyLogs,
            [today]: { ...currentLog, waterIntake: currentLog.waterIntake + amount }
        }
    }));
  };

  const handleSendMessage = (msg: ChatMessage) => {
    setState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, msg]
    }));
  };

  if (!state.profile && view === 'ONBOARDING') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // If profile exists but state is null (loading), show spinner or dashboard
  if (!state.profile) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      {/* Top Bar */}
      {view !== 'LOG_FOOD' && (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2" onClick={() => setView('DASHBOARD')}>
                <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
                <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800 tracking-tight">Calorie<span className="text-emerald-600">Snap</span></span>
            </div>
            </div>
        </header>
      )}

      <main className="max-w-lg mx-auto p-4 pb-24 min-h-[calc(100vh-80px)]">
        {view === 'DASHBOARD' && (
            <Dashboard 
                profile={state.profile} 
                todayLog={getTodayLog()} 
                onAddWater={updateWater} 
                onLogFood={() => setView('LOG_FOOD')} 
            />
        )}

        {view === 'LOG_FOOD' && (
            <div className="space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                     <button onClick={() => setView('DASHBOARD')} className="text-gray-500 font-medium hover:text-gray-800">Cancel</button>
                     <h2 className="font-bold text-lg">Log Meal</h2>
                     <div className="w-10"></div>
                </div>
                
                {/* Simulate Barcode Button */}
                <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors">
                    <ScanBarcode className="w-5 h-5" />
                    Scan Barcode (Simulated)
                </button>

                <InputForm onAnalyze={handleLogFood} isAnalyzing={status === AppStatus.ANALYZING} />
                
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
                        {error}
                    </div>
                )}
            </div>
        )}

        {view === 'RESULT' && currentResult && (
            <div className="space-y-6 animate-fade-in-up">
                <AnalysisResult data={currentResult} />
                <div className="flex gap-4 sticky bottom-4 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-2xl border border-gray-100">
                    <button 
                        onClick={() => { setCurrentResult(null); setView('LOG_FOOD'); }}
                        className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl"
                    >
                        Retake
                    </button>
                    <button 
                        onClick={confirmFoodLog}
                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                    >
                        Add to Diary
                    </button>
                </div>
            </div>
        )}

        {view === 'COACH' && (
            <AICoach 
                history={state.chatHistory} 
                onSendMessage={handleSendMessage} 
                userContext={{ profile: state.profile, todayLog: getTodayLog() }} 
            />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16">
            <button 
                onClick={() => setView('DASHBOARD')}
                className={`flex flex-col items-center gap-1 transition-colors ${view === 'DASHBOARD' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <LayoutDashboard className="w-6 h-6" />
                <span className="text-[10px] font-medium">Home</span>
            </button>
            
            <button 
                onClick={() => setView('LOG_FOOD')}
                className="flex flex-col items-center justify-center -mt-6"
            >
                <div className="w-14 h-14 bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white transform transition-transform active:scale-95">
                    <PlusCircle className="w-8 h-8" />
                </div>
            </button>
            
            <button 
                onClick={() => setView('COACH')}
                className={`flex flex-col items-center gap-1 transition-colors ${view === 'COACH' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <MessageSquare className="w-6 h-6" />
                <span className="text-[10px] font-medium">Coach</span>
            </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
