
import React, { useState, useRef, useEffect } from 'react';
import { gemini, encodeAudioToBlob, decodeBase64Audio, decodeToAudioBuffer } from '../services/geminiService';
import { LocalizationStrings, Language, Book, ChatMessage } from '../types';

interface VoiceAssistantProps {
  strings: LocalizationStrings;
  currentLanguage: Language;
  book: Book | null;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ strings, currentLanguage, book }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startVoiceSession = async () => {
    setIsConnecting(true);
    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      if (!outAudioContextRef.current) outAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const callbacks = {
        onopen: () => {
          setIsActive(true);
          setIsConnecting(false);
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            if (sessionRef.current && isActive) {
              const inputData = e.inputBuffer.getChannelData(0);
              const blob = encodeAudioToBlob(inputData);
              sessionRef.current.sendRealtimeInput({ media: blob });
            }
          };
          source.connect(processor);
          processor.connect(audioContextRef.current!.destination);
        },
        onmessage: async (msg: any) => {
          const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            const bytes = decodeBase64Audio(audioBase64);
            const buffer = await decodeToAudioBuffer(bytes, outAudioContextRef.current!);
            const source = outAudioContextRef.current!.createBufferSource();
            source.buffer = buffer;
            source.connect(outAudioContextRef.current!.destination);
            source.start();
          }
        },
        onclose: stopSession
      };

      const systemInstruction = `You are Nur-kitoblar Assistant. Help users with books. Context: ${book ? book.title : 'Discovery'}. lang: ${currentLanguage}. Respond naturally and concisely.`;
      sessionRef.current = await gemini.connectLive(callbacks, systemInstruction);
    } catch (err) { 
      setIsConnecting(false); 
      alert("Microphone access is required for voice session.");
    }
  };

  const handleTextSend = async () => {
    if (!inputText.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await gemini.chatWithAI(history, inputText);
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {}
  };

  const stopSession = () => {
    setIsActive(false);
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      {/* Visual Assistant Sphere Section */}
      <div className="lg:col-span-5 flex flex-col items-center bg-slate-900 rounded-[3rem] p-12 text-white shadow-pro-lg relative overflow-hidden h-[600px] justify-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent"></div>
        
        <div className={`z-10 w-56 h-56 rounded-full flex items-center justify-center transition-pro duration-700 relative ${
          isActive ? 'scale-110 shadow-[0_0_100px_rgba(59,130,246,0.5)]' : 'bg-slate-800 shadow-inner'
        }`}>
          {/* Animated Rings for Active State */}
          {isActive && (
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping"></div>
          )}
          <svg className={`w-28 h-28 ${isActive ? 'text-blue-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>

        <div className="z-10 mt-12 space-y-4">
          <h2 className="text-4xl font-black tracking-tighter">Live Conversation</h2>
          <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">{strings.chatPlaceholder}</p>
        </div>

        <div className="z-10 mt-12 w-full max-w-xs">
          <button 
            onClick={isActive ? stopSession : startVoiceSession}
            disabled={isConnecting}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-pro shadow-2xl active:scale-95 ${
              isActive ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {isConnecting ? 'Initializing AI...' : isActive ? strings.stopLive : strings.startLive}
          </button>
        </div>

        {/* Dynamic Waveform Visualizer */}
        {isActive && (
          <div className="z-10 mt-10 flex gap-1 h-12 items-center">
            {[...Array(24)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-blue-400 rounded-full animate-bounce" 
                style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Transcript / Text Interface */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[3rem] shadow-pro border border-slate-100 dark:border-slate-800 flex flex-col h-[600px] overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
              <h3 className="font-black text-xl tracking-tight text-slate-800 dark:text-white">Transcript History</h3>
           </div>
           <button onClick={() => setMessages([])} className="text-xs font-black text-slate-400 hover:text-rose-500 transition-pro uppercase tracking-widest">Clear</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <svg className="w-16 h-16 mb-4 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
              <p className="font-bold">No conversation history yet</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] px-6 py-4 rounded-[1.8rem] text-sm font-bold shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
           <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-[2rem] border-2 border-transparent focus-within:border-blue-600 focus-within:bg-white transition-pro shadow-inner">
             <input 
               type="text" 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleTextSend()}
               placeholder={strings.askAnything}
               className="flex-1 bg-transparent border-none outline-none px-6 font-bold text-lg text-slate-800 dark:text-white"
             />
             <button onClick={handleTextSend} className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:rotate-6 active:scale-90 transition-pro">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
