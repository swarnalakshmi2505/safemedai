import React, { useState, useEffect } from 'react';

function useCounter(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setVal(target);
        clearInterval(timer);
      } else {
        setVal(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

export default function StatCard({ icon, label, value, sub, color, trend }) {
  const num = useCounter(typeof value === 'number' ? value : 0);
  
  return (
    <div className="clinical-card group relative overflow-hidden !p-8">
      {/* Decorative Elite Accent */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundColor: `${color}10` }}
      />
      
      <div className="relative z-10">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {icon}
        </div>
        
        <div className="flex flex-col">
          <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">
            {label}
          </div>
          <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-brand-blue transition-colors duration-300">
            {typeof value === 'number' ? num.toLocaleString() : value}
          </div>
        </div>
        
        {sub && (
          <div className={`mt-6 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${
            trend === 'up' ? 'text-brand-emerald' : trend === 'down' ? 'text-brand-red' : 'text-slate-500'
          }`}>
            <div className={`p-1.5 rounded-lg ${
              trend === 'up' ? 'bg-brand-emerald/10' : trend === 'down' ? 'bg-brand-red/10' : 'bg-slate-100 dark:bg-white/5'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
            </div>
            <span>{sub}</span>
          </div>
        )}
      </div>
    </div>
  );
}
