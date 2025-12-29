import React, { useState, useRef, useEffect } from 'react';
import { Camera, Type as TypeIcon, X, Mic, MicOff, ImageIcon } from 'lucide-react';

interface InputFormProps {
  onAnalyze: (text: string, file: File | null) => void;
  isAnalyzing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setText((prev) => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    } else {
        recognitionRef.current?.start();
        setIsListening(true);
    }
  };

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !selectedFile) return;
    onAnalyze(text, selectedFile);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* iOS Grouped List Style */}
        <div className="bg-white rounded-[18px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            
            {/* Photo Section */}
            <div className="p-4 border-b border-gray-100">
                {!previewUrl ? (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition-all"
                    >
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#007AFF]">
                            <Camera className="w-6 h-6" />
                        </div>
                        <span className="font-medium text-sm">Tap to take a photo</span>
                    </button>
                ) : (
                    <div className="relative h-64 w-full rounded-xl overflow-hidden">
                         <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                         <button 
                            type="button"
                            onClick={handleClearFile}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                         >
                            <X className="w-4 h-4" />
                         </button>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={onFileInputChange}
                    accept="image/*"
                    className="hidden" 
                />
            </div>

            {/* Description Section */}
            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Describe your meal (e.g., 2 eggs, 1 slice toast)..."
                    className="w-full p-4 min-h-[140px] text-gray-900 placeholder-gray-400 resize-none outline-none text-lg font-normal leading-relaxed bg-white"
                />
                <div className="absolute bottom-3 right-3">
                    {recognitionRef.current && (
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="px-2">
            <button
            type="submit"
            disabled={isAnalyzing || (!text && !selectedFile)}
            className={`w-full py-4 rounded-[18px] font-semibold text-[17px] shadow-sm transition-all active:scale-[0.98]
                ${isAnalyzing || (!text && !selectedFile)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#007AFF] text-white shadow-blue-500/20 hover:bg-blue-600'
                }`}
            >
            {isAnalyzing ? 'Analyzing...' : 'Log Meal'}
            </button>
        </div>
      </form>
    </div>
  );
};