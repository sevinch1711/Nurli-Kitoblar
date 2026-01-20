
import React, { useState, useEffect } from 'react';
import { Language, Book, ReaderSettings } from './types';
import { LOCALES } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Library from './components/Library';
import Reader from './components/Reader';
import SettingsPage from './components/SettingsPage';
import VoiceAssistant from './components/VoiceAssistant';
import SummaryManager from './components/SummaryManager';
import AIChatBot from './components/AIChatBot';
import AudioLibrary from './components/AudioLibrary';
import AIAudioGenerator from './components/AIAudioGenerator';

const App: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(Language.EN);
  const [activeTab, setActiveTab] = useState<'library' | 'reader' | 'settings' | 'live' | 'summary' | 'audio' | 'ai-audio'>('library');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 20,
    theme: 'light',
    ttsSpeed: 1.0,
    ttsPitch: 1.0,
    voiceName: 'Kore'
  });

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentLanguage, settings.theme]);

  const strings = LOCALES[currentLanguage];

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setActiveTab('reader');
  };

  return (
    <div className={`min-h-screen flex font-pro transition-colors duration-500 ${
      settings.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 
      settings.theme === 'sepia' ? 'bg-[#fdf6e3] text-[#5f4b32]' : 
      'bg-slate-50 text-slate-900'
    }`}>
      
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[200] bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
        Skip to content
      </a>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        strings={strings} 
      />

      <div className="flex-1 flex flex-col lg:ml-[280px]">
        
        <Header 
          strings={strings} 
          currentLanguage={currentLanguage} 
          onLanguageChange={setCurrentLanguage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main id="main-content" className="flex-grow p-6 lg:p-10 page-entry overflow-x-hidden">
          {activeTab === 'library' && (
            <Library 
              strings={strings} 
              onBookSelect={handleBookSelect} 
              currentLanguage={currentLanguage} 
            />
          )}
          
          {activeTab === 'reader' && (
            <Reader 
              book={selectedBook} 
              settings={settings} 
              strings={strings} 
              onBack={() => setActiveTab('library')} 
            />
          )}
          
          {activeTab === 'summary' && (
            <SummaryManager 
              strings={strings} 
              currentLanguage={currentLanguage} 
            />
          )}
          
          {activeTab === 'live' && (
            <VoiceAssistant 
              strings={strings} 
              currentLanguage={currentLanguage} 
              book={selectedBook} 
            />
          )}
          
          {activeTab === 'settings' && (
            <SettingsPage 
              settings={settings} 
              setSettings={setSettings} 
              currentLanguage={currentLanguage} 
              setCurrentLanguage={setCurrentLanguage} 
              strings={strings} 
            />
          )}

          {activeTab === 'audio' && (
            <AudioLibrary 
              strings={strings} 
              currentLanguage={currentLanguage} 
            />
          )}

          {activeTab === 'ai-audio' && (
            <AIAudioGenerator 
              strings={strings} 
            />
          )}
        </main>

        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`fixed bottom-10 right-10 w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-all z-[100] ${
            isChatOpen ? 'bg-rose-500 rotate-90' : 'bg-blue-600 hover:scale-110 active:scale-95'
          } text-white`}
          aria-label="Toggle AI Assistant"
        >
          {isChatOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          )}
        </button>

        <AIChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} strings={strings} />

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-[150] shadow-pro">
          <MobileNavBtn active={activeTab === 'library'} onClick={() => setActiveTab('library')} icon="M4 6h16M4 10h16M4 14h16M4 18h16" />
          <MobileNavBtn active={activeTab === 'live'} onClick={() => setActiveTab('live')} icon="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          <MobileNavBtn active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <MobileNavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37" />
        </nav>
      </div>
    </div>
  );
};

const MobileNavBtn: React.FC<{ active: boolean; onClick: () => void; icon: string }> = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-pro ${active ? 'bg-blue-600 text-white shadow-lg scale-110' : 'text-slate-400'}`}>
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} /></svg>
  </button>
);

export default App;
