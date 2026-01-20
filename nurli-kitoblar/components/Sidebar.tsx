
import React from 'react';
import { LocalizationStrings } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  strings: LocalizationStrings;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, strings }) => {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] glass-sidebar flex-col z-[120]">
      {/* Brand Logo */}
      <div className="p-8 pb-12">
        <div 
          className="flex items-center gap-4 group cursor-pointer" 
          onClick={() => setActiveTab('library')}
        >
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-pro-lg group-hover:rotate-6 transition-pro">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">
            {strings.title}
          </span>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Core Library</p>
        <SidebarNavItem 
          active={activeTab === 'library'} 
          onClick={() => setActiveTab('library')} 
          label={strings.library} 
          icon="M4 6h16M4 10h16M4 14h16M4 18h16" 
        />
        <SidebarNavItem 
          active={activeTab === 'summary'} 
          onClick={() => setActiveTab('summary')} 
          label={strings.bookSummary} 
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
        />
        <SidebarNavItem 
          active={activeTab === 'audio'} 
          onClick={() => setActiveTab('audio')} 
          label={strings.audioBook} 
          icon="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707" 
        />

        <div className="pt-10">
          <p className="px-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">AI Tools</p>
          <SidebarNavItem 
            active={activeTab === 'live'} 
            onClick={() => setActiveTab('live')} 
            label={strings.aiVoiceChat} 
            icon="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
          />
          <SidebarNavItem 
            active={activeTab === 'ai-audio'} 
            onClick={() => setActiveTab('ai-audio')} 
            label={strings.aiAudio} 
            icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" 
          />
        </div>
      </nav>

      {/* Footer Nav */}
      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <SidebarNavItem 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          label={strings.settings} 
          icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572" 
        />
      </div>
    </aside>
  );
};

const SidebarNavItem: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-pro ${
      active 
        ? 'nav-active shadow-pro' 
        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600'
    }`}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} /></svg>
    {label}
  </button>
);

export default Sidebar;
