import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Search as SearchIcon, ChevronDown } from 'lucide-react';

export default function Layout({ children, title }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex font-sans selection:bg-brand-blue/30 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen min-w-0 relative overflow-hidden">
        
        {/* Modern Top Intelligence Bar */}
        <header className="sticky top-0 z-40 h-20 bg-opacity-80 backdrop-blur-xl border-b border-white/5 px-8 flex justify-between items-center transition-all duration-300">
          <div className="flex flex-col">
            <h2 className="text-xs font-black text-brand-blue uppercase tracking-[0.3em] animate-in fade-in slide-in-from-left-4 duration-500">
              {title || 'SafeMedAI Node'}
            </h2>
            <div className="flex items-center gap-2 mt-1 opacity-60">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                System Online · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Global Search Mockup */}
            <div className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 group focus-within:border-brand-blue/40 transition-all">
              <SearchIcon className="w-4 h-4 text-surface-500 group-focus-within:text-brand-blue" />
              <input 
                placeholder="Command Search..." 
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-white px-3 w-40 focus:outline-none placeholder:text-surface-600"
              />
              <span className="text-[8px] bg-white/10 text-surface-500 px-1.5 py-0.5 rounded-md font-mono">⌘K</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                title={isDark ? "Activate Light Mode" : "Activate Dark Mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-brand-amber group-hover:rotate-90 transition-transform duration-500" />
                ) : (
                  <Moon className="w-4 h-4 text-brand-blue group-hover:-rotate-12 transition-transform duration-500" />
                )}
              </button>
              
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all relative">
                <Bell className="w-4 h-4 text-surface-400" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-red rounded-full border border-brand-navy animate-pulse" />
              </button>
            </div>

            <div className="h-8 w-[1px] bg-white/10 mx-2" />

            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-[10px] font-black text-white leading-none uppercase tracking-widest group-hover:text-brand-blue transition-colors">
                  {user?.full_name?.split(' ')[0] || 'System'}
                </p>
                <p className="text-[9px] font-bold text-surface-500 uppercase tracking-tighter mt-1">
                  {user?.role === 'doctor' ? 'Clinical Staff' : 'PV Intelligence'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan p-[1px] shadow-glow-blue/10 group-hover:shadow-glow-blue/20 transition-all">
                <div className="w-full h-full rounded-xl bg-brand-navy flex items-center justify-center text-xs font-black text-white">
                  {user?.full_name?.substring(0, 2).toUpperCase() || 'AI'}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-surface-500 group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>
        </header>

        {/* Intelligence Content Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative z-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>

        {/* Ambient Decor - Only in dark mode */}
        {isDark && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-blue/5 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-brand-cyan/5 blur-[100px] rounded-full"></div>
          </div>
        )}
      </main>
    </div>
  );
}
