import React, { useState } from 'react';
import { AlertCircle, X, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function AlertBanner({ level, drug, msg }) {
  const [visible, setVisible] = useState(true);
  
  const configs = {
    CRITICAL: { 
      bg: "bg-brand-red/5 dark:bg-brand-red/10", 
      border: "border-brand-red/20 dark:border-brand-red/30", 
      text: "text-brand-red", 
      icon: <ShieldAlert className="w-5 h-5 text-brand-red" />,
      pulse: "shadow-glow-red/20"
    },
    HIGH: { 
      bg: "bg-brand-amber/5 dark:bg-brand-amber/10", 
      border: "border-brand-amber/20 dark:border-brand-amber/30", 
      text: "text-brand-amber", 
      icon: <AlertTriangle className="w-5 h-5 text-brand-amber" />,
      pulse: "shadow-glow-amber/20"
    },
    MEDIUM: { 
      bg: "bg-brand-blue/5 dark:bg-brand-blue/10", 
      border: "border-brand-blue/20 dark:border-brand-blue/30", 
      text: "text-brand-blue", 
      icon: <AlertCircle className="w-5 h-5 text-brand-blue" />,
      pulse: "shadow-glow-blue/20"
    },
  };

  const levelUpper = level?.toUpperCase() || 'MEDIUM';
  const cfg = configs[levelUpper] || configs.MEDIUM;

  if (!visible) return null;

  return (
    <div className={`
      ${cfg.bg} border ${cfg.border} ${cfg.pulse}
      rounded-2xl p-4 flex items-center gap-4
      transition-all duration-300 hover:scale-[1.02]
      animate-safemed-slidein backdrop-blur-md relative overflow-hidden group
    `}>
      <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50" style={{ color: 'inherit' }} />
      
      <div className="flex-shrink-0">
        {cfg.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`font-black text-xs uppercase tracking-tighter ${cfg.text}`}>{drug}</span>
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 uppercase tracking-widest ${cfg.text} opacity-80`}>
            {levelUpper}
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-black leading-tight truncate">
          {msg}
        </p>
      </div>
      
      <button 
        onClick={() => setVisible(false)}
        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
