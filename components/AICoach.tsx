import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
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
            text: "I'm having trouble connecting right now. Please try again.",
            timestamp: Date.now()
        };
        onSendMessage(errorMsg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <Bot className="w-6 h-6" />
        </div>
        <div>
            <h3 className="font-bold text-gray-800">AI Nutrition Coach</h3>
            <p className="text-xs text-emerald-600 font-medium">Online & Ready to Help</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {history.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Ask me anything about your diet, meal plans, or nutrition!</p>
            </div>
        )}
        {history.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}>
                    {msg.text}
                </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-2 items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your macros, meal ideas..."
                className="flex-1 bg-slate-50 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition-colors shadow-lg shadow-emerald-600/20"
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};