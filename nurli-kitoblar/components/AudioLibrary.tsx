
import React, { useState } from 'react';
import { Book, Language, LocalizationStrings } from '../types';

interface AudioLibraryProps {
  strings: LocalizationStrings;
  currentLanguage: Language;
}

const AudioLibrary: React.FC<AudioLibraryProps> = ({ strings, currentLanguage }) => {
  const [currentTrack, setCurrentTrack] = useState<Book | null>(null);

  const audioBooks: Book[] = [
    { 
      id: 'a1', 
      title: 'O‘tkan Kunlar (Audio)', 
      author: 'Abdulla Qodiriy', 
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&h=900&auto=format&fit=crop', 
      language: Language.UZ 
    },
    { 
      id: 'a2', 
      title: 'Atomic Habits (AI Narrated)', 
      author: 'James Clear', 
      coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=600&h=900&auto=format&fit=crop', 
      language: Language.EN 
    },
    { 
      id: 'a3', 
      title: 'Anna Karenina (Classic Audio)', 
      author: 'Leo Tolstoy', 
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&h=900&auto=format&fit=crop', 
      language: Language.RU 
    }
  ];

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter mb-3">
            {strings.audioBook}
          </h2>
          <p className="text-slate-500 font-bold text-lg">
            Sun'iy intellekt yordamida jonlantirilgan premium audio asarlar to'plami.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:border-blue-500 transition-all">
            Janrlar
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
            AI Podcast
          </button>
        </div>
      </header>

      {/* Hero Playing Section */}
      {currentTrack ? (
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-[3rem] p-10 text-white shadow-pro-lg flex flex-col md:flex-row items-center gap-10">
          <div className="w-56 h-56 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
            <img src={currentTrack.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-pro duration-1000" alt={currentTrack.title} />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div>
              <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Hozir ijro etilmoqda</span>
              <h3 className="text-4xl font-black mb-1">{currentTrack.title}</h3>
              <p className="text-slate-400 font-bold text-xl">{currentTrack.author}</p>
            </div>
            
            {/* Simple Player UI */}
            <div className="space-y-4">
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[35%] rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"></div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black text-slate-500">
                <span>12:45</span>
                <span>45:20</span>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-8">
              <button className="text-slate-400 hover:text-white transition-all"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
              <button className="w-20 h-20 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl">
                 <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <button className="text-slate-400 hover:text-white transition-all"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18h2V6h-2zM6 6v12l8.5-6z"/></svg></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-[3rem] p-16 text-center border-4 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707" /></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Tinglashni boshlang</h3>
          <p className="text-slate-500 font-bold max-w-xs mx-auto">Kutubxonadan biror audio asarni tanlang va mutolaadan zavqlaning.</p>
        </div>
      )}

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {audioBooks.map((book) => (
          <div 
            key={book.id}
            onClick={() => setCurrentTrack(book)}
            className="group bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] shadow-pro border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-blue-500 transition-all flex items-center gap-6"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
              <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={book.title} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-slate-900 dark:text-white truncate">{book.title}</h4>
              <p className="text-xs text-slate-400 font-bold mb-3">{book.author}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-[9px] font-black text-blue-600 rounded-md uppercase tracking-widest">{book.language}</span>
                <span className="text-[10px] font-bold text-slate-400">45:12 • 12MB</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioLibrary;
