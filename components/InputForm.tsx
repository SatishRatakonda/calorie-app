import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Type as TypeIcon, X, ImagePlus, Mic, MicOff } from 'lucide-react';

interface InputFormProps {
  onAnalyze: (text: string, file: File | null) => void;
  isAnalyzing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
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
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-emerald-100/50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Image Upload Area */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Food Photo</label>
          
          {!previewUrl ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                ${isDragging 
                  ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' 
                  : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 bg-slate-50/50'
                }
              `}
            >
              <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-emerald-200' : 'bg-emerald-100'}`}>
                <Camera className={`w-8 h-8 ${isDragging ? 'text-emerald-700' : 'text-emerald-600'}`} />
              </div>
              <p className="text-emerald-900 font-medium text-lg">Drop meal photo here</p>
              <p className="text-sm text-emerald-600/70 mt-1">or tap to browse</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden shadow-md group">
              <img src={previewUrl} alt="Food preview" className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button
                  type="button"
                  onClick={handleClearFile}
                  className="px-4 py-2 bg-white rounded-full text-red-500 font-medium shadow-lg hover:bg-red-50 transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Remove Photo
                </button>
              </div>
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

        {/* Text Input Area with Voice */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Description</label>
          <div className="relative group">
            <div className="absolute top-3 left-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <TypeIcon className="w-5 h-5" />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Grilled salmon with asparagus..."
              className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none h-24 placeholder-gray-400"
            />
            {recognitionRef.current && (
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isAnalyzing || (!text && !selectedFile)}
          className={`w-full py-4 px-4 rounded-2xl text-white font-bold text-lg shadow-lg transform transition-all duration-200 flex items-center justify-center gap-2
            ${isAnalyzing || (!text && !selectedFile)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/30 hover:-translate-y-0.5'
            }`}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Meal...
            </>
          ) : (
            <>
              <ImagePlus className="w-5 h-5" />
              Log Meal
            </>
          )}
        </button>
      </form>
    </div>
  );
};