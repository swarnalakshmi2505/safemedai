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
    <div className="safemed-card safemed-card-hover group relative overflow-hidden">
      {/* Decorative circle */}
      <div 
        className="absolute -top-5 -right-5 w-20 h-20 rounded-full transition-transform duration-300 group-hover:scale-125"
        style={{ backgroundColor: `${color}12` }}
      />
      
      <div className="text-2xl mb-2">{icon}</div>
      
      <div className="text-3xl font-black text-white tracking-tight group-hover:text-brand-cyan transition-colors">
        {typeof value === 'number' ? num.toLocaleString() : value}
      </div>
      
      <div className="text-[10px] font-bold text-surface-400 uppercase tracking-widest mt-1">{label}</div>
      
      {sub && (
        <div className={`mt-4 text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-tight ${
          trend === 'up' ? 'text-brand-emerald' : trend === 'down' ? 'text-brand-red' : 'text-surface-500'
        }`}>
          <span className="p-1 rounded-md bg-white/5">{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}</span>
          {sub}
        </div>
      )}
    </div>
  );
}
