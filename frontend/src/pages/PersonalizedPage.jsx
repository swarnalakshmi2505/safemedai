import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, AlertTriangle, CheckCircle, Search, Loader2, Info, Activity, BrainCircuit, Users, Thermometer } from 'lucide-react'
import Layout from '../components/Layout'
import { advancedAPI } from '../services/api'
import RiskRing from '../components/RiskRing'

export default function PersonalizedPage() {
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ drug: '', age: '', gender: 'male' })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const analyze = async () => {
    if (!form.drug || !form.age) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await advancedAPI.getPersonalized(
        form.drug.toLowerCase(), parseInt(form.age), form.gender
      )
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Patient profile analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Patient-Specific Intelligence Node">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-cyan/10 border border-brand-cyan/20 rounded-3xl flex items-center justify-center shadow-lg animate-pulse-slow">
              <Users className="w-8 h-8 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                Demographic <span className="text-brand-cyan">Variance</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mt-3">
                Disproportionality Analysis Adjusted for Patient Sub-Groups
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-brand-blue/10 px-4 py-2 rounded-full border border-brand-blue/20">
             <div className="status-dot text-brand-blue" />
             <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Profile Engine Ready</span>
          </div>
        </div>

        {/* Input Configuration Matrix */}
        <div className="clinical-card !p-10 stagger-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                Target Compound
              </label>
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                <input
                  value={form.drug}
                  onChange={e => setForm(p => ({...p, drug: e.target.value}))}
                  placeholder="E.G. METFORMIN"
                  className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-14 py-5 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand-blue/50 focus:bg-white dark:focus:bg-white/10 transition-all uppercase tracking-widest"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                Patient Age
              </label>
              <div className="relative group">
                 <Thermometer className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-cyan transition-colors" />
                 <input
                   type="number" min="1" max="120"
                   value={form.age}
                   onChange={e => setForm(p => ({...p, age: e.target.value}))}
                   placeholder="YEARS"
                   className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-14 py-5 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand-cyan/50 focus:bg-white dark:focus:bg-white/10 transition-all uppercase tracking-widest"
                 />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                Gender Node
              </label>
              <select
                value={form.gender}
                onChange={e => setForm(p => ({...p, gender: e.target.value}))}
                className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-6 py-[1.15rem] text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-brand-emerald/50 transition-all cursor-pointer uppercase tracking-widest"
              >
                <option value="male">Male Population</option>
                <option value="female">Female Population</option>
                <option value="unknown">Non-Specified</option>
              </select>
            </div>
          </div>
          <button
            onClick={analyze}
            disabled={loading || !form.drug || !form.age}
            className="btn-premium w-full !py-6 flex items-center justify-center gap-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Activity className="w-5 h-5" />}
            {loading ? 'CALIBRATING DEMOGRAPHIC MATRIX...' : 'RUN ADJUSTED RISK ANALYSIS'}
          </button>
        </div>

        {error && (
          <div className="bg-brand-red/10 border-2 border-brand-red/20 text-brand-red rounded-3xl px-8 py-5 text-xs font-black flex items-center gap-4 animate-in fade-in zoom-in duration-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="uppercase tracking-widest">{error}</span>
          </div>
        )}

        {/* Dynamic Adjusted Matrix Result */}
        {result && (
          <div className="space-y-10 page-entrance">

            {/* Elite Comparison Visualizer */}
            <div className="clinical-card !p-12 border-l-[12px] border-brand-blue group overflow-hidden relative">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-12 border-b border-black/5 dark:border-white/5 pb-6 flex items-center gap-4">
                Variance Matrix: <span className="text-brand-blue">{result.drug_name.toUpperCase()}</span> 
                <span className="text-slate-400 text-sm">·</span>
                <span className="text-slate-500 text-sm font-black tracking-widest">{result.age}Y · {result.gender.toUpperCase()}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10 items-center">
                <div className="flex flex-col items-center bg-black/5 dark:bg-white/5 p-10 rounded-[3rem] border border-black/5 dark:border-white/5">
                  <RiskRing score={result.base_risk_score} size={100} strokeWidth={6} />
                  <p className="mt-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] leading-none mb-2">Base Signal</p>
                  <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Global Aggregate</span>
                </div>
                <div className="flex flex-col items-center bg-brand-blue/5 dark:bg-brand-blue/10 p-10 rounded-[3rem] border border-brand-blue/20 shadow-xl shadow-brand-blue/5">
                  <RiskRing score={result.adjusted_score} size={140} strokeWidth={8} />
                  <p className="mt-6 text-[11px] font-black text-brand-blue uppercase tracking-[0.3em] leading-none mb-2">Adjusted Intensity</p>
                  <span className="text-[10px] font-black text-brand-blue/60 uppercase tracking-widest">Target Sub-Group</span>
                </div>
              </div>

              <div className="mt-12 p-8 bg-brand-blue/5 dark:bg-black/20 rounded-3xl border border-dashed border-brand-blue/30 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                   <Bot className="w-5 h-5 text-brand-blue" />
                   <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Neural Recommendation</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-base font-bold leading-relaxed italic">
                  "{result.recommendation}"
                </p>
              </div>
            </div>

            {/* Targeted Demographic Alerts */}
            {result.warnings?.length > 0 && (
              <div className="clinical-card !p-12 border-t-8 border-brand-amber/40 bg-brand-amber/5">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg border border-brand-amber/20">
                    <AlertTriangle className="w-7 h-7 text-brand-amber" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-brand-amber uppercase tracking-tighter leading-none">
                      Demographic Criticalities
                    </h3>
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-2">Targeted Alerts for this Patient Node</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex gap-5 bg-white/60 dark:bg-black/40 p-6 rounded-2xl border border-brand-amber/20 group hover:border-brand-amber/40 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-brand-amber mt-1.5 flex-shrink-0 animate-pulse" />
                      <p className="text-slate-900 dark:text-slate-200 text-xs font-bold leading-relaxed uppercase tracking-wide">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specific ADR Clustering Matrix */}
            {result.top_reactions_for_demo?.length > 0 && (
              <div className="clinical-card !p-12">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-brand-emerald/10 rounded-2xl flex items-center justify-center shadow-lg border border-brand-emerald/20">
                      <Activity className="w-7 h-7 text-brand-emerald" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Sub-Group ADR Clustering</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Based on {result.demo_reports} Target-Filtered Nodes</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {result.top_reactions_for_demo.map((r, i) => (
                    <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-black/[0.04] dark:hover:bg-white/5 transition-all">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-slate-900 dark:text-white text-sm font-black uppercase tracking-widest">{r.reaction}</span>
                        <span className="text-brand-emerald text-[11px] font-black uppercase tracking-widest">{r.count} Clinical Nodes</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-emerald rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.min(100, (r.count / result.demo_reports) * 1000)}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
              <button
                onClick={() => navigate(`/officer/drug/${result.drug_name}`)}
                className="btn-premium !bg-slate-100 dark:!bg-white/5 !text-slate-900 dark:!text-white border-2 border-black/5 dark:border-white/10 shadow-none hover:!bg-white dark:hover:!bg-white/10"
              >
                EXAMINE DEEP MOLECULAR PROFILE →
              </button>
              <button
                onClick={() => navigate('/officer/chatbot', { state: { drugContext: result.drug_name } })}
                className="btn-premium flex items-center justify-center gap-4"
              >
                <BrainCircuit className="w-6 h-6" />
                <span>CONSULT AI ANALYST INTELLIGENCE</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
