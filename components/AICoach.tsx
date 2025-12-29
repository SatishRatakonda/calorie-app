import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { askNutritionCoach } from '../services/gemini';

interface AICoachProps {
  history: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  userContext: any;
}

export const AICoach: React.FC<AICoachProps> = ({ history, onSendMessage, userContext }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: input,
        timestamp: Date.now()
    };

    onSendMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
        const responseText = await askNutritionCoach(input, history, userContext.profile, userContext.todayLog);
        const modelMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: responseText,
            timestamp: Date.now()
        };
        onSendMessage(modelMsg);
    } catch (e) {
        const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: "I'm having trouble connecting. Check your internet.",
            timestamp: Date.now()
        };
        onSendMessage(errorMsg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#F2F2F7]">
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Nutrition Assistant</h3>
                <p className="text-sm text-gray-500 max-w-xs">Ask me to analyze your meals, suggest recipes, or explain your macros.</p>
            </div>
        )}
        
        {history.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                    className={`max-w-[80%] px-4 py-2.5 text-[17px] leading-snug shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-[#007AFF] text-white rounded-[20px] rounded-tr-none' 
                        : 'bg-white text-black rounded-[20px] rounded-tl-none border border-gray-100'
                    }`}
                >
                    {msg.text}
                </div>
            </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-[20px] rounded-tl-none border border-gray-100 shadow-sm flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 bg-[#F2F2F7] pb-safe">
        <div className="flex gap-2 items-end">
            <div className="flex-1 bg-white border border-gray-300/50 rounded-[24px] px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-[#007AFF] transition-all">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="iMessage"
                    className="w-full text-[17px] bg-transparent outline-none text-gray-900 placeholder-gray-400 h-8"
                />
            </div>
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all mb-1.5 flex-shrink-0 ${
                    input.trim() ? 'bg-[#007AFF] text-white' : 'bg-gray-300 text-white'
                }`}
            >
                <Send className="w-4 h-4 fill-current ml-0.5" />
            </button>
        </div>
      </div>
    </div>
  );
};