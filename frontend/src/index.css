@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #FDFDFF;
    --bg-secondary: #F8FAFC;
    --text-primary: #0F172A;
    --text-secondary: #475569;
    --text-muted: #64748B;
    --border-color: rgba(0, 0, 0, 0.06);
    --card-bg: #FFFFFF;
    --accent-blue: #2563EB;
    --accent-cyan: #0EA5E9;
    --accent-emerald: #10B981;
    --accent-red: #EF4444;
  }

  .dark {
    --bg-primary: #020617;
    --bg-secondary: #0B1222;
    --text-primary: #F1F5F9;
    --text-secondary: #CBD5E1;
    --text-muted: #94A3B8;
    --border-color: rgba(255, 255, 255, 0.12);
    --card-bg: rgba(15, 23, 42, 0.8);
    --accent-blue: #3B82F6;
    --accent-cyan: #38BDF8;
    --accent-emerald: #10B981;
    --accent-red: #F87171;
  }

  body {
    @apply antialiased transition-colors duration-500 selection:bg-brand-blue/20;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold tracking-tight;
    font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
    color: var(--text-primary);
  }
}

@layer components {
  .clinical-card {
    @apply backdrop-blur-2xl border rounded-[2rem] p-8 transition-all duration-500 ease-out;
    background-color: var(--card-bg);
    border-color: var(--border-color);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  }

  .dark .clinical-card {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .clinical-card:hover {
    @apply border-brand-blue/40 -translate-y-1;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .glass-button {
    @apply flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 backdrop-blur-xl border-2;
    background-color: rgba(0, 0, 0, 0.02);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .dark .glass-button {
    background-color: rgba(255, 255, 255, 0.03);
  }

  .glass-button:hover {
    @apply bg-brand-blue/10 border-brand-blue/40 scale-[1.02] text-brand-blue;
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.15);
  }

  .sidebar-link {
    @apply flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold text-xs uppercase tracking-widest;
    color: var(--text-muted);
  }

  .sidebar-link:hover {
    @apply bg-brand-blue/5 text-brand-blue translate-x-1;
  }

  .sidebar-link-active {
    @apply bg-brand-blue/10 text-brand-blue border border-brand-blue/30 font-black scale-[1.02];
    box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.2);
  }

  .btn-premium {
    @apply relative overflow-hidden bg-brand-blue hover:bg-brand-blue/90 text-white font-black text-xs uppercase tracking-[0.2em] px-10 py-5 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50;
    box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
  }

  .btn-premium::after {
    content: '';
    @apply absolute inset-0 bg-white/20 translate-x-[-100%] transition-transform duration-500 skew-x-[-20deg];
  }

  .btn-premium:hover::after {
    @apply translate-x-[100%];
  }

  .status-dot {
    @apply w-2.5 h-2.5 rounded-full relative;
  }

  .status-dot::after {
    content: '';
    @apply absolute inset-0 rounded-full animate-ping opacity-75;
    background-color: currentColor;
  }

  .page-entrance {
    animation: entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes entrance {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .stagger-1 { @apply page-entrance; animation-delay: 0.1s; }
  .stagger-2 { @apply page-entrance; animation-delay: 0.2s; }
  .stagger-3 { @apply page-entrance; animation-delay: 0.3s; }
  .stagger-4 { @apply page-entrance; animation-delay: 0.4s; }
  .stagger-5 { @apply page-entrance; animation-delay: 0.5s; }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-300/50 rounded-full hover:bg-slate-400/50 transition-colors;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-700/50 rounded-full hover:bg-slate-600/50;
}

/* Luxury Grain Effect */
.dark body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.015;
  pointer-events: none;
  z-index: 9999;
}
