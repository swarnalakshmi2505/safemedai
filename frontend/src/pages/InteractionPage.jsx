import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Loader2, 
  Info, 
  Activity, 
  BrainCircuit,
  ChevronRight,
  FlaskConical,
  Dna,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import Layout from '../components/Layout'
import { advancedAPI } from '../services/api'
import RiskRing from '../components/RiskRing'
import toast from 'react-hot-toast'

const severityConfig = {
  severe:   { color: 'text-brand-red',    bg: 'bg-brand-red/5 border-brand-red/20',    icon: '🚨', label: 'Severe / Critical'   },
  moderate: { color: 'text-brand-amber',  bg: 'bg-brand-amber/5 border-brand-amber/20', icon: '⚠️', label: 'Moderate Signal'  },
  mild:     { color: 'text-brand-blue',   bg: 'bg-brand-blue/5 border-brand-blue/20',   icon: '⚡', label: 'Mild / Marginal'      },
  none:     { color: 'text-brand-emerald', bg: 'bg-brand-emerald/5 border-brand-emerald/20', icon: '✅', label: 'No Significant Risk' },
}

const EXAMPLE_PAIRS = [
  ['warfarin', 'aspirin'],
  ['ibuprofen', 'naproxen'],
  ['metformin', 'lisinopril'],
  ['sertraline', 'tramadol'],
]

export default function InteractionPage() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const [drugA,     setDrugA]   = useState('')
  const [drugB,     setDrugB]   = useState('')
  const [result,    setResult]  = useState(null)
  const [loading,   setLoading] = useState(false)
  const [error,     setError]   = useState('')

  useEffect(() => {
    if (location.state?.drugA) {
      setDrugA(location.state.drugA)
      if (location.state?.drugB) setDrugB(location.state.drugB)
    }
  }, [location.state])

  const check = async () => {
    if (!drugA.trim() || !drugB.trim()) {
      toast.error("Please provide two compound signatures.")
      return
    }
    
    setLoading(true); setError(''); setResult(null)
    const toastId = toast.loading("Executing dual-signal correlation analysis...")
    
    try {
      const res = await advancedAPI.getInteraction(
        drugA.trim().toLowerCase(),
        drugB.trim().toLowerCase()
      )
      
      if (res.data.error) {
        setError(res.data.error)
        toast.error(res.data.error, { id: toastId })
      } else {
        setResult(res.data)
        toast.success("Intelligence matrix synchronized.", { id: toastId })
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Correlation engine node failure.'
      setError(msg)
      toast.error(msg, { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  const runExample = (pair) => {
    setDrugA(pair[0]);
    setDrugB(pair[1]);
    // Small delay to allow state update before checking
    setTimeout(() => {
       document.getElementById('execute-btn')?.click();
    }, 100);
  }

  const sc = result ? (severityConfig[result.severity] || severityConfig.none) : null

  return (
    <Layout title="Interaction Intelligence Matrix">
      <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-safemed-fadein">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/5 dark:border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-brand-blue/10 border border-brand-blue/20 rounded-[2rem] flex items-center justify-center shadow-glow-blue/10">
              <Zap className="w-10 h-10 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                Synergy & <span className="text-brand-blue">Antagonism</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
                <Dna className="w-4 h-4 text-brand-cyan" />
                Precision Multi-Compound Correlation Engine
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 bg-slate-100 dark:bg-white/5 px-6 py-3 rounded-2xl border border-black/5 dark:border-white/10">
             <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Link Synchronized</span>
          </div>
        </div>

        {/* Input Control Matrix */}
        <div className="clinical-card !p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <FlaskConical className="w-40 h-40 text-brand-blue" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 relative z-10">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                Compound Alpha Signature
              </label>
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                <input
                  value={drugA}
                  onChange={e => setDrugA(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && check()}
                  placeholder="E.G. WARFARIN"
                  className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-16 py-6 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-blue/40 transition-all uppercase tracking-[0.1em]"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                Compound Beta Signature
              </label>
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-cyan transition-colors" />
                <input
                  value={drugB}
                  onChange={e => setDrugB(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && check()}
                  placeholder="E.G. ASPIRIN"
                  className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-16 py-6 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-cyan/40 transition-all uppercase tracking-[0.1em]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <button
              id="execute-btn"
              onClick={check}
              disabled={loading}
              className="btn-premium w-full md:w-auto px-12 py-6 flex items-center justify-center gap-4 group"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Activity className="w-5 h-5 group-hover:scale-125 transition-transform" />}
              <span className="uppercase tracking-widest text-[11px] font-black">
                {loading ? 'Executing Neural Logic...' : 'Run Correlation Analysis'}
              </span>
            </button>
            
            <div className="flex items-center gap-4 flex-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Stubs:</span>
               <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PAIRS.map(pair => (
                    <button
                      key={pair.join('-')}
                      onClick={() => runExample(pair)}
                      className="text-[9px] font-black text-slate-500 hover:text-brand-blue uppercase bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 px-4 py-2 rounded-lg transition-colors"
                    >
                      {pair[0]} + {pair[1]}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-brand-red/10 border-2 border-brand-red/20 text-brand-red rounded-[2rem] px-10 py-6 text-xs font-black flex items-center gap-4 animate-safemed-slidein">
            <ShieldAlert className="w-6 h-6" />
            <span className="uppercase tracking-widest">{error}</span>
          </div>
        )}

        {/* Results Matrix */}
        {result && sc && (
          <div className="space-y-12 animate-safemed-fadein">
            
            {/* Executive Intelligence Card */}
            <div className={`clinical-card !p-12 border-l-[16px] ${sc.bg} relative overflow-hidden group`}>
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                  <Activity className={`w-40 h-40 ${sc.color}`} />
               </div>
               
               <div className="flex flex-col lg:flex-row items-start justify-between gap-12 mb-12 relative z-10">
                  <div className="flex gap-10">
                     <div className={`w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl border border-black/5 dark:border-white/10`}>
                        {sc.icon}
                     </div>
                     <div>
                        <h2 className={`text-5xl font-black tracking-tighter ${sc.color} uppercase leading-tight mb-2`}>
                           {sc.label} Severity
                        </h2>
                        <div className="flex items-center gap-3 text-slate-500 font-black text-[11px] uppercase tracking-widest">
                           <span className="text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/10">{result.drug_a}</span>
                           <ArrowRight className="w-4 h-4 text-brand-blue" />
                           <span className="text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-black/5 dark:border-white/10">{result.drug_b}</span>
                        </div>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="flex items-baseline gap-2">
                        <span className={`text-7xl font-black ${sc.color} tracking-tighter`}>{result.risk_amplification}</span>
                        <span className="text-2xl font-black text-slate-400">X</span>
                     </div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Risk Amplification Factor</p>
                  </div>
               </div>

               <div className="bg-white/60 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white dark:border-white/10 shadow-inner relative z-10">
                  <div className="flex items-center gap-3 mb-6 text-slate-400">
                     <Info className="w-5 h-5" />
                     <span className="text-[11px] font-black uppercase tracking-[0.2em]">Clinical Intelligence Summary</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-xl font-bold leading-relaxed italic">
                     "{result.summary}"
                  </p>
               </div>
            </div>

            {/* Compound Profile Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { name: result.drug_a, score: result.drug_a_score, reactions: result.drug_a_reactions, color: 'text-brand-blue' },
                 { name: result.drug_b, score: result.drug_b_score, reactions: result.drug_b_reactions, color: 'text-brand-cyan' },
               ].map((drug) => (
                 <div key={drug.name} 
                    onClick={() => navigate(`/officer/drug/${drug.name}`)}
                    className="clinical-card !p-10 group cursor-pointer hover:border-brand-blue/40 transition-all"
                 >
                    <div className="flex justify-between items-center mb-8 border-b border-black/5 dark:border-white/5 pb-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compound signature</p>
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white capitalize group-hover:text-brand-blue transition-colors">{drug.name}</h3>
                       </div>
                       <RiskRing score={drug.score} size={80} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                       {drug.reactions.map(r => (
                         <span key={r} className="text-[10px] font-black bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-4 py-2 rounded-xl uppercase tracking-widest border border-black/5 dark:border-white/10 group-hover:border-brand-blue/20 transition-all">
                           {r}
                         </span>
                       ))}
                    </div>
                 </div>
               ))}
            </div>

            {/* Overlapping Reaction Matrix */}
            <div className="clinical-card !p-12 border-t-[12px] border-brand-amber/30">
               <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                  <div className="flex items-center gap-6">
                     <div className="w-16 h-16 bg-brand-amber/10 rounded-[1.5rem] flex items-center justify-center">
                        <Activity className="w-8 h-8 text-brand-amber" />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Shared ADR Intersection</h3>
                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-2">Critical Signal Overlap identified in global FAERS nodes</p>
                     </div>
                  </div>
                  <div className="px-6 py-3 bg-brand-amber/10 text-brand-amber border border-brand-amber/20 rounded-full text-[11px] font-black uppercase tracking-widest">
                     {result.shared_reactions.length} Intersections Found
                  </div>
               </div>

               {result.shared_reactions.length > 0 ? (
                 <div className="flex flex-wrap gap-4">
                   {result.shared_reactions.map((r, i) => (
                     <div key={i} className="bg-brand-amber/5 border-2 border-brand-amber/10 text-brand-amber text-xs font-black px-8 py-4 rounded-2xl shadow-lg shadow-brand-amber/5 hover:scale-105 transition-transform cursor-default">
                        {r.toUpperCase()}
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-10 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-black/10 dark:border-white/10">
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No overlapping adverse reaction signals identified.</p>
                 </div>
               )}
               
               <div className="mt-12 p-8 bg-brand-amber/5 rounded-[2.5rem] border border-dashed border-brand-amber/30 text-center">
                  <p className="text-xs font-black text-brand-amber/80 uppercase tracking-widest leading-relaxed">
                     Clinical Warning: Overlapping reactions indicate common toxicity pathways. Concurrent administration may trigger non-linear escalation of adverse profile momentum.
                  </p>
               </div>
            </div>

            {/* AI Action CTA */}
            <div className="flex justify-center pt-10">
               <button
                 onClick={() => navigate('/officer/chatbot', {
                   state: { drugContext: `Interaction between ${result.drug_a} and ${result.drug_b} with ${result.risk_amplification}x risk amplification.` }
                 })}
                 className="btn-premium !bg-slate-900 dark:!bg-white !text-white dark:!text-slate-900 !px-16 !py-8 flex items-center gap-6 group rounded-[2rem] shadow-2xl"
               >
                 <BrainCircuit className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                 <div className="text-left">
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Neural PV Assistant</span>
                    <span className="text-lg font-black uppercase tracking-tighter">Consult AI Intelligence Agent →</span>
                 </div>
               </button>
            </div>
            
          </div>
        )}
      </div>
    </Layout>
  )
}
