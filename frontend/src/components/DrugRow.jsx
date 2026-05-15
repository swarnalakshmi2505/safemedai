import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  Skull, 
  Zap,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export default function DrugRow({ rank, name, score, reports, deathReports, topReactions, trend, delay, isCompact }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Determine risk level and colors
  const getRiskLevel = (s) => {
    if (s >= 75) return { label: 'Critical', color: 'text-brand-red', bg: 'bg-brand-red/10', border: 'border-brand-red/20', bar: 'bg-brand-red' };
    if (s >= 55) return { label: 'High', color: 'text-brand-amber', bg: 'bg-brand-amber/10', border: 'border-brand-amber/20', bar: 'bg-brand-amber' };
    if (s >= 35) return { label: 'Medium', color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20', bar: 'bg-brand-blue' };
    return { label: 'Low', color: 'text-brand-emerald', bg: 'bg-brand-emerald/10', border: 'border-brand-emerald/20', bar: 'bg-brand-emerald' };
  };

  const risk = getRiskLevel(score);

  return (
    <div 
      onClick={() => navigate(`/officer/drug/${name}`)}
      className={`
        relative group cursor-pointer transition-all duration-500
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}
        flex ${isCompact ? 'flex-col' : 'flex-col sm:flex-row'} items-center gap-6 p-6 rounded-[2rem]
        bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10
        hover:bg-brand-blue/[0.02] hover:border-brand-blue/30 hover:shadow-glow-blue/10
      `}
    >
      {/* Rank & Identity */}
      <div className={`flex items-center gap-6 w-full ${isCompact ? '' : 'sm:w-auto'}`}>
        <div className={`
          w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black flex-shrink-0
          ${rank === 1 ? 'bg-brand-amber/20 text-brand-amber border border-brand-amber/30 shadow-glow-amber/10' : 
            rank === 2 ? 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white border border-black/10 dark:border-white/10' :
            rank === 3 ? 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/5' :
            'bg-black/5 dark:bg-white/[0.02] text-slate-400 dark:text-slate-600 border border-black/5 dark:border-white/5'}
        `}>
          {rank.toString().padStart(2, '0')}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize truncate group-hover:text-brand-blue transition-colors">
              {name}
            </h3>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${risk.bg} ${risk.color} border ${risk.border} flex-shrink-0`}>
              {risk.label}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
               <ShieldAlert className="w-3 h-3" /> Node-{name.slice(0, 3).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Metrics Visual */}
      <div className="flex-1 w-full space-y-3">
        <div className="flex justify-between items-end">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Risk Potential Matrix</p>
           <p className={`text-lg font-black ${risk.color} tracking-tighter`}>{score}%</p>
        </div>
        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex">
           <div 
             className={`h-full ${risk.bar} transition-all duration-1000 delay-300 shadow-glow-current/20`}
             style={{ width: visible ? `${score}%` : '0%' }}
           />
        </div>
        {!isCompact && (
          <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
             <span>0.0 Magnitude</span>
             <span>100.0 Critical</span>
          </div>
        )}
      </div>

      {/* Data Metrics */}
      <div className={`grid grid-cols-2 ${isCompact ? '' : 'sm:flex'} items-center gap-8 w-full ${isCompact ? '' : 'sm:w-auto border-t sm:border-t-0 sm:border-l'} border-black/5 dark:border-white/5 pt-6 ${isCompact ? '' : 'sm:pt-0 sm:pl-8'}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
             <Activity className="w-3 h-3" />
             <span className="text-[9px] font-black uppercase tracking-widest">Signals</span>
          </div>
          <span className="text-sm font-black text-slate-900 dark:text-white">{reports.toLocaleString()}</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-brand-red/60 mb-1">
             <Skull className="w-3 h-3" />
             <span className="text-[9px] font-black uppercase tracking-widest">Fatalities</span>
          </div>
          <span className="text-sm font-black text-brand-red">{deathReports ? deathReports.toLocaleString() : 'N/A'}</span>
        </div>
      </div>

      {/* Top Reactions (Hidden in compact or on tiny screens) */}
      {!isCompact && (
        <div className="hidden lg:flex flex-wrap gap-2 max-w-[200px]">
          {(topReactions || []).slice(0, 2).map((rx, idx) => (
            <span key={idx} className="px-3 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter whitespace-nowrap">
              {rx}
            </span>
          ))}
        </div>
      )}

      {/* Action (Hidden in compact) */}
      {!isCompact && (
        <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 group-hover:bg-brand-blue group-hover:text-white transition-all">
           <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </div>
  );
}
