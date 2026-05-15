import React, { useState, useEffect } from 'react';
import RiskRing from './RiskRing';

export default function DrugRow({ rank, name, score, reports, trend, delay }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`
      flex items-center gap-4 p-3 px-4 rounded-xl cursor-pointer
      transition-all duration-300
      ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
      bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-brand-blue/30 hover:shadow-glow-blue/5 group
    `}>
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black
        ${rank === 1 ? 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20 shadow-glow-amber/5' : 
          rank === 2 ? 'bg-surface-800 text-white border border-white/10' :
          'bg-white/5 text-surface-500 border border-white/10'}
      `}>
        {rank}
      </div>
      
      <div className="flex-1 min-w-0 ml-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-white capitalize truncate group-hover:text-brand-cyan transition-colors">{name}</p>
          <span className="text-[10px] text-surface-500 font-mono">#{name.slice(0, 3).toUpperCase()}</span>
        </div>
        <p className="text-[10px] font-bold text-surface-500 uppercase tracking-tighter">{reports.toLocaleString()} SIGNAL EVENTS</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className={`text-sm font-black ${score >= 70 ? 'text-brand-red' : score >= 55 ? 'text-brand-amber' : 'text-brand-cyan'}`}>{score}%</p>
          <p className="text-[9px] font-bold text-surface-600 uppercase tracking-widest">DISPROP.</p>
        </div>
        <div className="w-10 h-10 group-hover:scale-110 transition-transform">
           <RiskRing score={score} size={40} strokeWidth={4} />
        </div>
      </div>
    </div>
  );
}
