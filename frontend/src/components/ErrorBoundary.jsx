import React from 'react';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Clinical System Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full clinical-card !p-12 text-center border-brand-red/30 bg-brand-red/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldAlert className="w-32 h-32 text-brand-red" />
            </div>
            
            <div className="w-20 h-20 bg-brand-red/10 border border-brand-red/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow-red/20">
              <ShieldAlert className="w-10 h-10 text-brand-red animate-pulse" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">System Fault Detected</h2>
            
            <p className="text-surface-500 text-sm font-medium mb-10 leading-relaxed uppercase tracking-widest">
              A clinical data node has encountered a critical exception. 
              Surveillance systems are attempting to isolate the breach.
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full btn-premium py-4 flex items-center justify-center gap-3 group"
              >
                <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="uppercase tracking-[0.2em] text-xs font-bold">Restart Protocol</span>
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-surface-400 py-4 rounded-xl transition-all flex items-center justify-center gap-3"
              >
                <Home className="w-4 h-4" />
                <span className="uppercase tracking-[0.2em] text-xs font-bold">Return to Command Hub</span>
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-10 pt-8 border-t border-white/5 text-left">
                <p className="text-[10px] font-mono text-brand-red/60 uppercase mb-2">Technical Exception Stack:</p>
                <div className="bg-black/40 p-4 rounded-lg overflow-auto max-h-40">
                  <code className="text-[10px] font-mono text-brand-red/80">
                    {this.state.error?.toString()}
                  </code>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
