import React, { useState, useEffect, useRef } from 'react';
import { InputForm } from './components/InputForm';
import { AnalysisResult } from './components/AnalysisResult';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { AICoach } from './components/AICoach';
import { analyzeFood } from './services/gemini';
import { NutritionAnalysis, AppStatus, UserProfile, DailyLog, ChatMessage } from './types';
import { Leaf, LayoutDashboard, MessageSquare, Plus, Undo2 } from 'lucide-react';

const STORAGE_KEY = 'caloriesnap_data_v3';

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

  // Undo State
  const [showUndo, setShowUndo] = useState(false);
  const [lastLogId, setLastLogId] = useState<string | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);

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

    // Trigger Undo functionality
    setLastLogId(currentResult.id);
    setShowUndo(true);
    
    if (undoTimeoutRef.current) {
      window.clearTimeout(undoTimeoutRef.current);
    }
    undoTimeoutRef.current = window.setTimeout(() => {
      setShowUndo(false);
      setLastLogId(null);
    }, 5000);

    setCurrentResult(null);
    setStatus(AppStatus.IDLE);
    setView('DASHBOARD');
  };

  const handleUndo = () => {
    if (!lastLogId) return;
    const today = new Date().toISOString().split('T')[0];
    const currentLog = getTodayLog();

    const updatedLog = {
        ...currentLog,
        meals: currentLog.meals.filter(meal => meal.id !== lastLogId)
    };

    setState(prev => ({
        ...prev,
        dailyLogs: {
            ...prev.dailyLogs,
            [today]: updatedLog
        }
    }));

    setShowUndo(false);
    setLastLogId(null);
    if (undoTimeoutRef.current) {
      window.clearTimeout(undoTimeoutRef.current);
    }
  };

  const handleDeleteMeal = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const currentLog = getTodayLog();

    const updatedLog = {
        ...currentLog,
        meals: currentLog.meals.filter(meal => meal.id !== id)
    };

    setState(prev => ({
        ...prev,
        dailyLogs: {
            ...prev.dailyLogs,
            [today]: updatedLog
        }
    }));
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

  if (!state.profile) return <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]"><div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-gray-900 pb-28 selection:bg-blue-100">
      
      {/* Dynamic Header */}
      {view === 'DASHBOARD' && (
        <header className="pt-14 pb-4 px-5 sticky top-0 z-40 bg-[#F2F2F7]/80 backdrop-blur-md transition-all">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <h1 className="text-4xl font-bold tracking-tight text-black">Summary</h1>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold border border-gray-300/50">
              {state.profile.name.charAt(0)}
            </div>
          </div>
        </header>
      )}
      
      {view === 'COACH' && (
        <header className="pt-4 pb-4 px-5 sticky top-0 z-40 bg-[#F2F2F7]/90 backdrop-blur-xl border-b border-gray-200">
            <h1 className="text-xl font-semibold text-center">Coach</h1>
        </header>
      )}

      <main className="max-w-lg mx-auto px-5 relative">
        {view === 'DASHBOARD' && (
            <Dashboard 
                profile={state.profile} 
                todayLog={getTodayLog()} 
                onAddWater={updateWater} 
                onLogFood={() => setView('LOG_FOOD')} 
                onDeleteMeal={handleDeleteMeal}
            />
        )}

        {view === 'LOG_FOOD' && (
            <div className="pt-10 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold tracking-tight">Log Meal</h2>
                    <button onClick={() => setView('DASHBOARD')} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors">
                        <span className="text-xl leading-none">&times;</span>
                    </button>
                </div>
                <InputForm onAnalyze={handleLogFood} isAnalyzing={status === AppStatus.ANALYZING} />
                
                {error && (
                    <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium text-center">
                        {error}
                    </div>
                )}
            </div>
        )}

        {view === 'RESULT' && currentResult && (
            <div className="pt-6 animate-slide-up pb-10">
                <AnalysisResult data={currentResult} />
                <div className="flex gap-3 fixed bottom-8 left-4 right-4 max-w-lg mx-auto">
                    <button 
                        onClick={() => { setCurrentResult(null); setView('LOG_FOOD'); }}
                        className="flex-1 py-4 bg-white text-black font-semibold rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmFoodLog}
                        className="flex-1 py-4 bg-[#007AFF] text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-transform"
                    >
                        Add Data
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

        {/* Apple-style Dynamic Island Toast */}
        {showUndo && (
           <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
             <div className="bg-black text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-6 min-w-[200px] justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                 </div>
                 <span className="font-medium text-sm tracking-wide">Added to Diary</span>
               </div>
               <button 
                 onClick={handleUndo}
                 className="text-blue-400 font-semibold text-sm active:opacity-70 transition-opacity flex items-center gap-1"
               >
                 <Undo2 className="w-4 h-4" />
                 Undo
               </button>
             </div>
           </div>
        )}
      </main>

      {/* iOS Tab Bar */}
      {view !== 'LOG_FOOD' && view !== 'RESULT' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 pb-safe pt-2 z-50">
            <div className="max-w-lg mx-auto flex justify-around items-center">
                <button 
                    onClick={() => setView('DASHBOARD')}
                    className={`flex flex-col items-center gap-1 w-16 transition-colors ${view === 'DASHBOARD' ? 'text-[#007AFF]' : 'text-gray-400'}`}
                >
                    <LayoutDashboard className="w-6 h-6" strokeWidth={view === 'DASHBOARD' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Summary</span>
                </button>
                
                <button 
                    onClick={() => setView('LOG_FOOD')}
                    className="flex flex-col items-center justify-center -mt-8"
                >
                    <div className="w-16 h-16 bg-[#007AFF] rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white transform transition-transform active:scale-95 hover:scale-105">
                        <Plus className="w-8 h-8" strokeWidth={3} />
                    </div>
                </button>
                
                <button 
                    onClick={() => setView('COACH')}
                    className={`flex flex-col items-center gap-1 w-16 transition-colors ${view === 'COACH' ? 'text-[#007AFF]' : 'text-gray-400'}`}
                >
                    <MessageSquare className="w-6 h-6" strokeWidth={view === 'COACH' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Coach</span>
                </button>
            </div>
        </nav>
      )}
    </div>
  );
};

export default App;