import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Zap,
  Users,
  Activity,
  Shield,
  BarChart3,
  BrainCircuit,
  FilePlus,
  User,
  UserCheck,
  Settings,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const officerNavItems = [
  { to: '/officer/dashboard',    icon: LayoutDashboard, label: 'Command Center'    },
  { to: '/officer/leaderboard',  icon: BarChart3,       label: 'Risk Intelligence' },
  { to: '/officer/search',       icon: Search,          label: 'Molecular Search'  },
  { to: '/officer/alerts',       icon: Bell,            label: 'Signal Alerts',      badge: 3 },
  { to: '/officer/interaction',  icon: Zap,             label: 'Drug Analytics' },
  { to: '/officer/personalized', icon: Users,           label: 'Patient Profiling' },
  { to: '/officer/sentiment',    icon: Activity,        label: 'Surveillance'    },
  { to: '/officer/reports',      icon: FileText,        label: 'Clinical Reports'      },
  { to: '/officer/chatbot',      icon: BrainCircuit,    label: 'AI Analyst' },
  { to: '/officer/verification', icon: UserCheck,       label: 'Verify Doctors' },
];

const doctorNavItems = [
  { to: '/doctor/dashboard',    icon: LayoutDashboard, label: 'Doctor Hub' },
  { to: '/doctor/submit',       icon: FilePlus,        label: 'New Report' },
  { to: '/doctor/my-reports',   icon: FileText,        label: 'My Submissions' },
  { to: '/doctor/drugs',        icon: Search,          label: 'Drug Search' },
  { to: '/doctor/chatbot',      icon: MessageSquare,   label: 'AI Assistant' },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'doctor' ? doctorNavItems : officerNavItems;

  return (
    <aside className={`sticky top-0 h-screen ${isCollapsed ? 'w-24' : 'w-72'} bg-white dark:bg-slate-950 border-r border-black/5 dark:border-white/5 flex flex-col z-50 transition-all duration-500 shadow-xl overflow-hidden`}>
      {/* Brand Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'} p-6 mb-4 relative`}>
        <div className="relative group flex-shrink-0">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${user?.role === 'doctor' ? 'from-teal-500 to-emerald-500' : 'from-brand-blue to-brand-cyan'} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div className={`absolute -inset-2 ${user?.role === 'doctor' ? 'bg-teal-500/20' : 'bg-brand-cyan/20'} blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
        </div>
        
        {!isCollapsed && (
          <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
            <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              SafeMed<span className={user?.role === 'doctor' ? 'text-teal-500' : 'text-brand-cyan'}>AI</span>
            </h1>
            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-1.5">Intelligence</span>
          </div>
        )}

        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute ${isCollapsed ? 'bottom-[-20px] left-1/2 -translate-x-1/2' : 'right-[-12px] top-1/2 -translate-y-1/2'} w-7 h-7 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-20 group`}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-500" /> : <ChevronLeft className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'px-4' : 'px-6'} space-y-2 overflow-y-auto custom-scrollbar mt-4`}>
        {!isCollapsed && <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-6">Operations Matrix</div>}
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            title={isCollapsed ? label : ''}
            className={({ isActive }) => `
              sidebar-link relative group overflow-hidden flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-4 px-5'}
              ${isActive ? (user?.role === 'doctor' ? '!bg-teal-500/10 !text-teal-500 !border-teal-500/30' : 'sidebar-link-active') : 'hover:bg-slate-100 dark:hover:bg-white/[0.03] text-slate-500 dark:text-slate-400'}
            `}
          >
            <Icon className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 flex-shrink-0 ${badge ? (user?.role === 'doctor' ? 'text-teal-500' : 'text-brand-cyan') : ''}`} />
            {!isCollapsed && <span className="flex-1 text-[11px] font-black uppercase tracking-widest">{label}</span>}
            {badge && !isCollapsed && (
              <span className="bg-brand-red/90 text-[9px] text-white px-2 py-0.5 rounded-lg font-black shadow-lg shadow-brand-red/20 flex-shrink-0">
                {badge}
              </span>
            )}
            {/* Active Glow */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 ${user?.role === 'doctor' ? 'bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.5)]' : 'bg-brand-cyan shadow-[0_0_15px_rgba(56,189,248,0.5)]'} rounded-r-full transition-all duration-500 transform scale-y-0 group-[.active]:scale-y-100 group-[.sidebar-link-active]:scale-y-100`} />
          </NavLink>
        ))}
      </nav>

      {/* System Status Module */}
      {!isCollapsed && (
        <div className="mx-6 my-6 p-5 bg-slate-100 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-3xl backdrop-blur-md">
           <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 ${user?.role === 'doctor' ? 'bg-teal-500/10' : 'bg-brand-blue/10'} rounded-xl`}>
                 <Cpu className={`w-4 h-4 ${user?.role === 'doctor' ? 'text-teal-500' : 'text-brand-blue'}`} />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Node Status</p>
                 <p className="text-[11px] font-bold text-slate-900 dark:text-white mt-1">Operational</p>
              </div>
              <div className="status-dot text-brand-emerald" />
           </div>
           <div className="w-full bg-slate-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className={`${user?.role === 'doctor' ? 'bg-teal-500' : 'bg-brand-blue'} h-full w-[84%] animate-pulse`} />
           </div>
           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-3 text-center">Encryption: AES-256 Enabled</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className={`p-6 border-t border-black/5 dark:border-white/5 space-y-2 bg-slate-50/50 dark:bg-black/20 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <NavLink
            to={user?.role === 'doctor' ? '/doctor/profile' : '/officer/profile'}
            title={isCollapsed ? 'Identity Node' : ''}
            className={({ isActive }) => `
              sidebar-link relative group flex items-center ${isCollapsed ? 'justify-center px-0 w-12' : 'gap-4 px-5'}
              ${isActive ? (user?.role === 'doctor' ? '!bg-teal-500/10 !text-teal-500 !border-teal-500/30' : 'sidebar-link-active') : 'hover:bg-slate-100 dark:hover:bg-white/[0.03] text-slate-500 dark:text-slate-400'}
            `}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">Identity Node</span>}
        </NavLink>
        <button
          onClick={() => { logout(); navigate('/'); }}
          title={isCollapsed ? 'Terminate Session' : ''}
          className={`flex items-center ${isCollapsed ? 'justify-center px-0 w-12' : 'gap-4 px-5'} py-3.5 rounded-2xl text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all duration-400 hover:bg-brand-red/10 hover:text-brand-red group`}
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
          {!isCollapsed && <span className="flex-1 text-left">Terminate</span>}
        </button>
      </div>
    </aside>
  );
}
