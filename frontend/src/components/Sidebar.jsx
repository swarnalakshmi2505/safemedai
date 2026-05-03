import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Shield,
  Trophy,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/officer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/officer/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/officer/search', icon: Search, label: 'Drug Search' },
  { to: '/officer/alerts', icon: Bell, label: 'Alerts' },
  { to: '/officer/reports', icon: FileText, label: 'Reports' },
  { to: '/officer/chatbot', icon: MessageSquare, label: 'AI Chatbot' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-56 flex-col border-r border-slate-800 bg-slate-950 text-white shadow-2xl shadow-slate-950/30">
      <div className="border-b border-slate-800 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight">SafeMedAI</p>
            <p className="text-[11px] text-slate-400">Pharmacovigilance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white',
              ].join(' ')
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="mb-2 px-3 py-2">
          <p className="truncate text-xs font-medium text-white">{user?.full_name}</p>
          <p className="text-xs capitalize text-sky-400">{user?.role}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
