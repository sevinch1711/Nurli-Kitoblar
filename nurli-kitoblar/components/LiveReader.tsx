
import React, { useState, useRef, useEffect } from 'react';
import { gemini, encodeAudioToBlob, decodeBase64Audio, decodeToAudioBuffer } from '../services/geminiService';
import { LocalizationStrings, Language, Book } from '../types';

interface LiveReaderProps {
  strings: LocalizationStrings;
  currentLanguage: Language;
  book: Book | null;
}

const LiveReader: React.FC<LiveReaderProps> = ({ strings, currentLanguage, book }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<string>('Ready for voice assistant');

  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    setIsConnecting(true);
    setStatus('Connecting to AI...');
    try {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      if (!outAudioContextRef.current) outAudioContextRef.current = new AudioContext({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const callbacks = {
        onopen: () => {
          setStatus('Connected! Speak to the assistant.');
          setIsActive(true);
          setIsConnecting(false);

          // Microphone streaming
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const blob = encodeAudioToBlob(inputData);
            if (sessionRef.current) {
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
            
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outAudioContextRef.current!.currentTime);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }

          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e: any) => {
          console.error("Live session error", e);
          setStatus('Connection error. Retrying...');
          stopSession();
        },
        onclose: () => stopSession()
      };

      const systemInstruction = `You are a professional reading assistant for NoorReader. 
      The current language is ${currentLanguage}.
      ${book ? `The user is currently reading "${book.title}" by ${book.author}. Here is some context: ${book.content?.slice(0, 1000)}` : ''}
      Help the user with pronunciation, summarize parts, or discuss the themes of the book. Keep responses concise and engaging.`;

      sessionRef.current = await gemini.connectLive(callbacks, systemInstruction);
    } catch (err) {
      console.error(err);
      setStatus('Could not access microphone.');
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setStatus('Voice assistant stopped.');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 rounded-3xl bg-emerald-600 shadow-2xl text-white text-center">
      <div className="mb-6">
        <div className={`w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4 ${isActive ? 'animate-pulse ring-8 ring-white/10' : ''}`}>
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Noor Assistant</h2>
        <p className="text-emerald-100 opacity-80">{status}</p>
      </div>

      {!isActive ? (
        <button 
          onClick={startSession}
          disabled={isConnecting}
          className="w-full py-4 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-colors shadow-lg active:scale-95 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : strings.startLive}
        </button>
      ) : (
        <button 
          onClick={stopSession}
          className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors shadow-lg active:scale-95"
        >
          {strings.stopLive}
        </button>
      )}

      {isActive && (
        <div className="mt-8 flex justify-center gap-1 h-8 items-end">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1 bg-white/40 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveReader;
