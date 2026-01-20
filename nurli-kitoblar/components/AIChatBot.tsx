
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LocalizationStrings, ChatMessage } from '../types';
import { gemini } from '../services/geminiService';

interface AIChatBotProps {
  strings: LocalizationStrings;
  isOpen: boolean;
  onClose: () => void;
}

interface Suggestion {
  label: string;
  icon: string;
}

const AIChatBot: React.FC<AIChatBotProps> = ({ strings, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Base suggestions for empty state
  const initialSuggestions: Suggestion[] = [
    { label: "Summarize current book", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: "How to use voice mode?", icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" },
    { label: "Explain accessibility tools", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  ];

  // Logic to determine context-aware suggestions
  const dynamicSuggestions = useMemo(() => {
    if (messages.length === 0) return initialSuggestions;
    
    const lastMsg = messages[messages.length - 1].text.toLowerCase();
    
    // Check for "Summarize" context
    if (lastMsg.includes('summary') || lastMsg.includes('summarize') || lastMsg.includes('xulosa')) {
      return [
        { label: "Main characters list", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        { label: "Themes and motifs", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        { label: "Analyze the ending", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
      ];
    }
    
    // Check for "Translation" context
    if (lastMsg.includes('translate') || lastMsg.includes('tarjima')) {
      return [
        { label: "Translate to Arabic", icon: "M3 5h12M9 3v2" },
        { label: "Analyze vocabulary", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253" },
        { label: "Check grammar rules", icon: "M15.536 8.464a5 5 0 010 7.072" }
      ];
    }

    // Default suggestions if conversation is ongoing but no specific trigger
    return [
      { label: "Recommend similar books", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
      { label: "Help with settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066" },
      { label: "Go to catalog", icon: "M4 6h16M4 10h16" }
    ];
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      const response = await gemini.chatWithAI(history, messageText);
      const aiMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: "I'm sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsLoading(true);
          try {
            const transcription = await gemini.transcribeAudio(base64Audio, 'audio/webm');
            if (transcription) handleSend(transcription);
          } catch (err) {
            console.error("Transcription error", err);
          } finally {
            setIsLoading(false);
          }
        };
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-28 right-6 w-[440px] h-[720px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] z-[200] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-12 fade-in duration-500">
      {/* Header - Refined Pro Look */}
      <div className="p-7 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white leading-tight text-lg">{strings.aiCompanion}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black">AI ONLINE</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 rounded-xl transition-all text-slate-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages - Improved Bubble Styling */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/20 dark:bg-slate-950/20">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-700">
             <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center mb-8">
                <svg className="w-10 h-10 text-blue-500 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
             </div>
             <p className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">I'm your Noor AI</p>
             <p className="font-bold text-sm text-slate-400 dark:text-slate-500 mb-10 leading-relaxed px-4">{strings.chatPlaceholder}</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] px-6 py-4 rounded-[1.8rem] text-sm leading-relaxed shadow-sm transition-all ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none font-bold' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 font-bold'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-5 py-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic Suggestions Section */}
      <div className="px-6 py-4 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar border-t border-slate-50 dark:border-slate-800">
        <div className="flex gap-3 min-w-max pb-1">
          {dynamicSuggestions.map((s, idx) => (
            <button 
              key={idx}
              onClick={() => handleSend(s.label)}
              className="flex items-center gap-2.5 px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/30 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={s.icon} /></svg>
              {s.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area - Cleaner Pro Design */}
      <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-[2rem] border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner">
          <button 
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-12 h-12 rounded-full transition-all flex items-center justify-center flex-shrink-0 ${
              isRecording 
                ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-blue-600 hover:text-white active:scale-90 shadow-sm'
            }`}
            title="Hold to speak"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
          
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? 'Listening...' : strings.askAnything}
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />

          <button 
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/20 flex items-center justify-center hover:bg-blue-700 active:scale-95 disabled:opacity-20 disabled:grayscale transition-all flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
        
        {isRecording && (
          <div className="flex justify-center mt-4 gap-0.5 h-4 items-end animate-in fade-in duration-300">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-blue-500 rounded-full animate-bounce" 
                style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.08}s` }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatBot;
