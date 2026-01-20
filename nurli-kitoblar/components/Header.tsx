
import React, { useState } from 'react';
import { LocalizationStrings, Language } from '../types';

interface HeaderProps {
  strings: LocalizationStrings;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Header: React.FC<HeaderProps> = ({ strings, currentLanguage, onLanguageChange, activeTab, setActiveTab }) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const languages = [
    { code: Language.EN, label: 'EN', name: 'English' },
    { code: Language.UZ, label: 'UZ', name: 'O‘zbek' },
    { code: Language.RU, label: 'RU', name: 'Русский' },
    { code: Language.TR, label: 'TR', name: 'Türkçe' },
    { code: Language.AR, label: 'AR', name: 'العربية' },
  ];

  return (
    <header className="h-24 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-[110] bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-transparent">
      
      {/* Search Bar - Professional Look */}
      <div className="hidden md:flex flex-1 max-w-xl group">
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder={strings.askAnything}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-12 py-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-pro shadow-sm"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-black text-slate-400 select-none">⌘K</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Language Selection */}
        <div className="relative">
          <button 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs shadow-sm hover:border-blue-500 hover:shadow-md transition-pro"
            aria-haspopup="true"
            aria-expanded={langMenuOpen}
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
            {currentLanguage.toUpperCase()}
          </button>
          
          {langMenuOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 animate-in slide-in-from-top-4 duration-300">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { onLanguageChange(l.code); setLangMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-pro ${currentLanguage === l.code ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Button - Settings */}
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-pro shadow-sm"
          title={strings.settings}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
