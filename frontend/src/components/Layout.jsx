import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Search as SearchIcon, ChevronDown } from 'lucide-react';

export default function Layout({ children, title }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className={`min-h-screen flex selection:bg-brand-blue/20 transition-colors duration-500 bg-slate-50 dark:bg-slate-950 overflow-hidden`}>
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="flex-1 flex flex-col min-h-screen min-w-0 relative overflow-hidden">
        
        {/* Elite Top Intelligence Bar */}
        <header className="sticky top-0 z-40 h-24 backdrop-blur-2xl border-b border-black/5 dark:border-white/[0.05] px-6 sm:px-10 flex justify-between items-center transition-all duration-500 bg-white/50 dark:bg-slate-950/50">
          <div className="flex flex-col">
            <h2 className={`text-[10px] font-black ${user?.role === 'doctor' ? 'text-teal-500 dark:text-teal-400' : 'text-brand-blue dark:text-brand-cyan'} uppercase tracking-[0.4em] animate-in fade-in slide-in-from-left-4 duration-700`}>
              {title || 'SafeMedAI Node 01'}
            </h2>
            <div className="flex items-center gap-3 mt-2 opacity-70">
              <div className={`status-dot ${user?.role === 'doctor' ? 'text-teal-500' : 'text-brand-emerald'}`} />
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Protocol Active · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Command Search Bar */}
            <div className={`hidden lg:flex items-center bg-slate-200/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3 group focus-within:border-${user?.role === 'doctor' ? 'teal-500/40' : 'brand-blue/40'} focus-within:bg-white/10 transition-all duration-300`}>
              <SearchIcon className={`w-4 h-4 text-slate-400 dark:text-surface-500 group-focus-within:${user?.role === 'doctor' ? 'text-teal-500' : 'text-brand-blue'}`} />
              <input 
                placeholder="COMMAND SEARCH..." 
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-100 px-4 w-56 focus:outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
              <span className="text-[9px] bg-slate-300 dark:bg-white/10 text-slate-500 dark:text-surface-500 px-2 py-1 rounded-lg font-mono font-bold">⌘K</span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className={`p-3 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10 hover:border-${user?.role === 'doctor' ? 'teal-500/20' : 'brand-blue/20'} transition-all group`}
              >
                {isDark ? (
                  <Sun className="w-4.5 h-4.5 text-amber-400 group-hover:rotate-90 transition-transform duration-700" />
                ) : (
                  <Moon className={`w-4.5 h-4.5 ${user?.role === 'doctor' ? 'text-teal-500' : 'text-brand-blue'} group-hover:-rotate-12 transition-transform duration-700`} />
                )}
              </button>
              
              <button className="p-3 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10 transition-all relative">
                <Bell className="w-4.5 h-4.5 text-slate-500 dark:text-surface-400" />
                <span className={`absolute top-3 right-3 w-2 h-2 ${user?.role === 'doctor' ? 'bg-teal-500' : 'bg-brand-red'} rounded-full border-2 border-white dark:border-brand-navy`} />
              </button>
            </div>

            <div className="h-10 w-[1px] bg-black/5 dark:bg-white/10 mx-1 sm:mx-2" />

            <div className="flex items-center gap-3 sm:gap-5 cursor-pointer group">
              <div className="hidden md:flex flex-col items-end">
                <p className={`text-[11px] font-black text-slate-900 dark:text-white leading-none uppercase tracking-[0.1em] group-hover:${user?.role === 'doctor' ? 'text-teal-500' : 'text-brand-blue'} transition-colors`}>
                  {user?.full_name || 'Authorized User'}
                </p>
                <p className="text-[9px] font-black text-slate-500 dark:text-surface-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                   <span className={`w-1 h-1 rounded-full ${user?.role === 'doctor' ? 'bg-teal-500' : 'bg-brand-blue'}`} />
                   {user?.role === 'doctor' ? 'Clinical Staff' : 'PV Intelligence'}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${user?.role === 'doctor' ? 'from-teal-500 to-emerald-500 shadow-teal-500/20' : 'from-brand-blue to-brand-cyan shadow-brand-blue/20'} p-[1px] shadow-lg group-hover:scale-105 transition-all duration-300`}>
                <div className={`w-full h-full rounded-2xl bg-white dark:bg-brand-navy flex items-center justify-center text-[11px] sm:text-[13px] font-black ${user?.role === 'doctor' ? 'text-teal-600' : 'text-brand-blue'} dark:text-white`}>
                  {user?.full_name?.substring(0, 2).toUpperCase() || 'AI'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Intelligence Content Area */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar relative z-10 scroll-smooth bg-slate-50 dark:bg-transparent">
          <div className="w-full page-entrance">
            {children}
          </div>
        </div>

        {/* Ambient Decor */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className={`absolute top-[-10%] right-[-5%] w-[45%] h-[45%] ${user?.role === 'doctor' ? 'bg-teal-500/5 dark:bg-teal-500/10' : 'bg-brand-blue/5 dark:bg-brand-blue/10'} blur-[150px] rounded-full opacity-50`}></div>
          <div className={`absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] ${user?.role === 'doctor' ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : 'bg-brand-cyan/5 dark:bg-brand-cyan/10'} blur-[120px] rounded-full opacity-50`}></div>
        </div>
      </main>
    </div>
  );
}
