
import React from 'react';
import { Language, ReaderSettings, LocalizationStrings } from '../types';
import { PREBUILT_VOICES } from '../constants';

interface SettingsProps {
  settings: ReaderSettings;
  setSettings: React.Dispatch<React.SetStateAction<ReaderSettings>>;
  currentLanguage: Language;
  setCurrentLanguage: (lang: Language) => void;
  strings: LocalizationStrings;
}

const SettingsPage: React.FC<SettingsProps> = ({ settings, setSettings, currentLanguage, setCurrentLanguage, strings }) => {
  const languages = [
    { code: Language.EN, name: 'English' },
    { code: Language.UZ, name: 'O‘zbekcha' },
    { code: Language.RU, name: 'Русский' }
  ];

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, fontSize: parseInt(e.target.value) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-32 pt-12">
      <header className="text-center md:text-left">
        <h2 className="text-5xl font-black text-blue-900 dark:text-blue-100 italic tracking-tight">{strings.settings}</h2>
        <p className="text-xl text-slate-500 font-bold mt-2">Ilovani o'zingizning qulayligingizga moslang.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Appearance Section */}
        <section className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-2xl border-4 border-blue-50 dark:border-blue-900">
          <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.828 2.828a2 2 0 010 2.828l-8.486 8.486" /></svg></div>
            Appearance
          </h3>
          <div className="flex gap-4 mb-8">
            {(['light', 'dark', 'sepia'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSettings({ ...settings, theme: t })}
                className={`flex-1 py-6 rounded-2xl border-2 capitalize transition-all font-black text-sm ${
                  settings.theme === t
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest">Font Size</label>
              <span className="text-xl font-black text-blue-600">{settings.fontSize}px</span>
            </div>
            <input 
              type="range" 
              min="12" 
              max="48" 
              value={settings.fontSize} 
              onChange={handleFontSizeChange}
              className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">
              <span>A (Small)</span>
              <span>A (Large)</span>
            </div>
          </div>
        </section>

        {/* Audio Persona Section */}
        <section className="bg-white dark:bg-slate-800 p-10 rounded-[3.5rem] shadow-2xl border-4 border-blue-50 dark:border-blue-900">
          <h3 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-8 flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg></div>
             Audio Voice
          </h3>
          <select
            value={settings.voiceName}
            onChange={(e) => setSettings({ ...settings, voiceName: e.target.value })}
            className="w-full bg-slate-50 dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-700 rounded-3xl px-8 py-5 text-xl font-black text-slate-900 dark:text-white outline-none focus:border-blue-600 appearance-none cursor-pointer"
          >
            {PREBUILT_VOICES.map(v => (
              <option key={v} value={v}>{v} Personality</option>
            ))}
          </select>
        </section>
      </div>

      {/* Language Section Full Width */}
      <section className="bg-white dark:bg-slate-800 p-12 rounded-[4rem] shadow-2xl border-4 border-blue-50 dark:border-blue-900">
        <h3 className="text-3xl font-black text-blue-900 dark:text-blue-100 mb-10 text-center italic">{strings.languageSelect}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setCurrentLanguage(lang.code)}
              className={`px-10 py-8 rounded-[2.5rem] border-4 text-center transition-all flex flex-col items-center gap-4 ${
                currentLanguage === lang.code
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40'
                  : 'border-slate-100 dark:border-slate-700 hover:border-blue-200'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${currentLanguage === lang.code ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                {lang.code.toUpperCase()}
              </div>
              <span className="text-2xl font-black">{lang.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
