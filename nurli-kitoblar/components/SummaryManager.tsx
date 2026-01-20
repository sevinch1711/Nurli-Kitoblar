
import React, { useState } from 'react';
import { LocalizationStrings, Language } from '../types';
import { gemini } from '../services/geminiService';

interface SummaryManagerProps {
  strings: LocalizationStrings;
  currentLanguage: Language;
}

const SummaryManager: React.FC<SummaryManagerProps> = ({ strings, currentLanguage }) => {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'error'>('idle');
  const [summary, setSummary] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const mimeType = file.type || 'application/pdf';
      
      try {
        setStatus('analyzing');
        // AI ga kitobni o'z tilida xulosalash buyrug'i integratsiya qilingan
        const result = await gemini.summarizeText(base64, mimeType);
        setSummary(result);
        setStatus('done');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="bg-white dark:bg-slate-800 p-10 md:p-16 rounded-[4rem] shadow-2xl border-4 border-blue-50 dark:border-blue-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <header className="mb-12 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black text-blue-900 dark:text-blue-100 italic tracking-tight mb-4">{strings.bookSummary}</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-bold max-w-2xl">
              Istalgan PDF yoki rasm ko'rinishidagi kitobni yuklang. AI butun matnni o'rganadi va uni o'z tilida chuqur tahlil qilib beradi.
            </p>
          </header>

          <label className="cursor-pointer group flex flex-col items-center justify-center border-4 border-dashed border-blue-200 dark:border-blue-800 rounded-[3rem] p-16 hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-500">
            <input type="file" className="hidden" onChange={handleFile} accept="application/pdf,image/*" />
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-[2rem] flex items-center justify-center mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all shadow-xl">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <span className="text-2xl font-black text-blue-900 dark:text-blue-100">{strings.dropFile}</span>
            <span className="text-sm text-blue-400 font-black mt-3 uppercase tracking-[0.2em]">PDF, JPG, PNG • Cheksiz Hajm</span>
          </label>
        </div>

        {status === 'analyzing' && (
          <div className="mt-12 p-12 bg-blue-700 text-white rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="relative w-24 h-24">
                 <div className="absolute inset-0 border-8 border-white/20 rounded-full"></div>
                 <div className="absolute inset-0 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
               </div>
               <div className="text-center md:text-left">
                 <h4 className="text-3xl font-black tracking-tight mb-2">{strings.summarizingStatus}</h4>
                 <p className="text-blue-100 text-lg font-bold opacity-80">{strings.processingPdf}</p>
               </div>
            </div>
          </div>
        )}

        {summary && status === 'done' && (
          <div className="mt-12 animate-in slide-in-from-bottom-12 duration-700">
             <div className="bg-slate-50 dark:bg-slate-900/50 p-12 rounded-[3.5rem] shadow-inner border border-blue-50 dark:border-blue-900">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-14 h-14 bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                   <h3 className="text-3xl font-black tracking-tight text-blue-900 dark:text-blue-100 italic">{strings.summaryTitle}</h3>
                </div>
                <div className="prose prose-blue dark:prose-invert max-w-none text-xl leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                  {summary.split('\n').map((para, i) => (
                    <p key={i} className="mb-6">{para}</p>
                  ))}
                </div>
                <button 
                  onClick={() => { setSummary(null); setStatus('idle'); }}
                  className="mt-10 px-8 py-3 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-200 transition-all"
                >
                  {strings.close}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryManager;
