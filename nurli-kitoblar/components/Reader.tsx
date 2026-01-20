
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Book, ReaderSettings, LocalizationStrings, Language } from '../types';
import { gemini, decodeBase64Audio, decodeToAudioBuffer } from '../services/geminiService';

interface ReaderProps {
  book: Book | null;
  settings: ReaderSettings;
  strings: LocalizationStrings;
  onBack: () => void;
}

const Reader: React.FC<ReaderProps> = ({ book: initialBook, settings, strings, onBack }) => {
  const [book, setBook] = useState<Book | null>(initialBook);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateMenuOpen, setTranslateMenuOpen] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const pages = useMemo(() => {
    if (!book?.content) return [];
    return book.content.match(/[\s\S]{1,1800}/g) || [];
  }, [book?.content]);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleDownloadCover = async () => {
    if (!book) return;
    try {
      const response = await fetch(book.coverUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${book.title}_cover.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download cover", err);
    }
  };

  const handleDownloadPdf = () => {
    if (book?.pdfUrl) {
      window.open(book.pdfUrl, '_blank');
    }
  };

  const handleTranslate = async (targetLang: Language) => {
    if (!book?.content || isTranslating) return;
    setIsTranslating(true);
    setTranslateMenuOpen(false);
    try {
      // For large books, we'd translate in chunks, but for this demo we translate the whole content
      const translatedContent = await gemini.translateText(book.content, targetLang);
      setBook({
        ...book,
        content: translatedContent,
        language: targetLang
      });
      setCurrentPage(0);
    } catch (err) {
      console.error("Translation failed", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlayTTS = async () => {
    if (isPlaying) { stopAudio(); return; }
    const textToRead = pages[currentPage];
    if (!textToRead) return;

    setIsGenerating(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const base64Audio = await gemini.generateSpeech(textToRead, settings.voiceName, book?.language || Language.EN);
      const audioBytes = decodeBase64Audio(base64Audio);
      const buffer = await decodeToAudioBuffer(audioBytes, audioContextRef.current);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (err) { console.error(err); } 
    finally { setIsGenerating(false); }
  };

  if (!book || pages.length === 0) return null;

  const isArabic = book.language === Language.AR;

  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center">
      
      {/* Immersive Controls Bar */}
      <div className="w-full flex items-center justify-between mb-10 px-4">
        <button onClick={onBack} className="flex items-center gap-3 font-black text-slate-400 hover:text-blue-600 transition-pro">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          {strings.library}
        </button>

        <div className="text-center flex-1 mx-4">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-1 truncate max-w-[200px] mx-auto">{book.title}</h2>
          <p className="text-[10px] font-bold text-slate-400">{book.author} • {book.language.toUpperCase()}</p>
        </div>

        <div className="flex items-center gap-3 relative">
           {/* Translation Dropdown */}
           <button 
            onClick={() => setTranslateMenuOpen(!translateMenuOpen)}
            disabled={isTranslating}
            className={`p-2.5 rounded-xl border transition-pro shadow-sm flex items-center gap-2 ${
              isTranslating ? 'bg-slate-100 border-slate-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500'
            } text-slate-50`}
            title="Translate Book"
           >
             {isTranslating ? (
               <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.198 15.298 6 19.718L6.249 18" /></svg>
             )}
             <span className="hidden sm:inline text-xs font-black text-slate-500">TRANSLATE</span>
           </button>

           {translateMenuOpen && (
             <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-4xl border border-slate-200 dark:border-slate-800 p-2 z-[130] animate-in slide-in-from-top-2">
                {[Language.EN, Language.UZ, Language.RU, Language.TR, Language.AR].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleTranslate(lang)}
                    disabled={book.language === lang}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-pro ${
                      book.language === lang 
                        ? 'bg-blue-50 text-blue-300 dark:bg-blue-900/20 dark:text-blue-800' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Translate to {lang.toUpperCase()}
                  </button>
                ))}
             </div>
           )}

           {/* Download Actions */}
           <button 
             onClick={handleDownloadCover}
             className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 hover:text-blue-600 transition-all"
             title={strings.downloadCover}
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
           </button>
           
           {book.pdfUrl && (
             <button 
               onClick={handleDownloadPdf}
               className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 hover:text-rose-600 transition-all"
               title={strings.downloadPdf}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
             </button>
           )}
        </div>
      </div>

      {/* Reading Surface */}
      <div className={`w-full max-w-4xl relative reader-font transition-pro p-10 md:p-16 lg:p-24 rounded-[4rem] shadow-pro-lg min-h-[70vh] mb-32
        ${settings.theme === 'dark' ? 'bg-slate-900 text-slate-200 border border-slate-800' : 
          settings.theme === 'sepia' ? 'bg-[#fdf6e3] text-[#5f4b32] border border-[#eee8d5]' : 
          'bg-white text-slate-900 border border-slate-100'}
        ${isArabic ? 'arabic-text text-right text-4xl leading-[2.2]' : 'text-xl leading-relaxed'}`}
        style={{ fontSize: `${settings.fontSize}px` }}
      >
        <div className="page-entry">
          {pages[currentPage]?.split('\n').map((p, i) => (
            <p key={i} className="mb-8 last:mb-0 leading-relaxed">{p}</p>
          ))}
        </div>
      </div>

      {/* Fixed Immersive Footer Controls */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 lg:left-[calc(280px+(100%-280px)/2)] lg:-translate-x-1/2 z-[100] flex items-center gap-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-10 py-5 rounded-[2.5rem] shadow-4xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-10 duration-700">
        
        <button 
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
          disabled={currentPage === 0}
          className="p-3 rounded-full text-slate-400 hover:text-blue-600 disabled:opacity-5 transition-pro"
          aria-label="Previous Page"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
        </button>

        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <button 
          onClick={handlePlayTTS} 
          disabled={isGenerating}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-pro shadow-xl group ${
            isPlaying ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-blue-600 text-white shadow-blue-600/30'
          } hover:scale-110 active:scale-95`}
          aria-label={isPlaying ? "Stop Voice" : "Listen Page"}
        >
          {isGenerating ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
          )}
        </button>

        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <button 
          onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))} 
          disabled={currentPage === pages.length - 1}
          className="p-3 rounded-full text-slate-400 hover:text-blue-600 disabled:opacity-5 transition-pro"
          aria-label="Next Page"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
        </button>

        <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-pro shadow-xl pointer-events-none">
          Page {currentPage + 1} of {pages.length}
        </div>
      </div>
    </div>
  );
};

export default Reader;
