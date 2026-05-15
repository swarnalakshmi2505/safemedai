import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
  BarChart, Bar, Cell
} from 'recharts'
import { 
  Bot, Zap, ArrowLeft, Pill, FileText, Activity, 
  AlertTriangle, CheckCircle, ShieldAlert, ChevronRight,
  Database, Search, FlaskConical, Dna, History,
  Info, Download, Shield, Users, BarChart3, TrendingUp,
  MapPin, Clock, Calendar, ShieldCheck, BrainCircuit,
  ThumbsUp, ThumbsDown, Stethoscope, Beaker
} from 'lucide-react'
import Layout from '../components/Layout'
import RiskRing from '../components/RiskRing'
import api, { downloadsAPI, analyticsAPI } from '../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'

const signalBadge = (sig, confirmed) => {
  if (!confirmed) return 'text-slate-500 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
  if (sig === 'strong')   return 'text-brand-red bg-brand-red/10 border-brand-red/20 shadow-glow-red/5'
  if (sig === 'moderate') return 'text-brand-amber bg-brand-amber/10 border-brand-amber/20'
  return                         'text-brand-blue bg-brand-blue/10 border-brand-blue/20'
}

function Section({ title, icon: Icon, children, className = "", subtitle = "" }) {
  return (
    <div className={`clinical-card ${className}`}>
      <div className="flex items-center justify-between mb-8 border-b border-black/5 dark:border-white/[0.05] pb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-brand-blue shadow-glow-blue/10">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
              {title}
            </h3>
            {subtitle && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

function ProgressBar({ label, value, max, color = "bg-brand-blue" }) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
        <span>{label}</span>
        <span>{value.toLocaleString()} ({percentage}%)</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function DrugDetailPage() {
  const { drugName } = useParams()
  const navigate     = useNavigate()
  const [drug,    setDrug]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!drugName) return
    setLoading(true); setError('')
    api.get(`/drugs/${drugName.toLowerCase()}`)
      .then(r => setDrug(r.data))
      .catch(err => {
        setError(err.response?.data?.detail || 'Clinical data node synchronization failure.')
      })
      .finally(() => setLoading(false))
  }, [drugName])

  if (loading) return (
    <Layout title="Initializing Intelligence Matrix">
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="w-16 h-16 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin shadow-glow-blue/20"></div>
        <div className="text-center">
          <p className="text-[11px] font-black text-brand-blue uppercase tracking-[0.3em] animate-pulse">Synchronizing Neural Data Clusters</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-2 font-bold">Connecting to Global Surveillance Grid...</p>
        </div>
      </div>
    </Layout>
  )

  if (error || !drug) return (
    <Layout title="Node Breach">
      <div className="max-w-2xl mx-auto mt-20">
        <div className="clinical-card !p-12 text-center border-brand-red/30 bg-brand-red/5">
          <ShieldAlert className="w-16 h-16 text-brand-red mx-auto mb-8" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">Signal Retrieval Error</h2>
          <p className="text-slate-500 text-sm mb-10">{error || 'Data cluster unreachable'}</p>
          <button onClick={() => navigate(-1)} className="btn-premium px-10">Abort Connection</button>
        </div>
      </div>
    </Layout>
  )

  const genderMax = Math.max(...Object.values(drug.gender_distribution || {}), 1);
  const ageMax = Math.max(...Object.values(drug.age_distribution || {}), 1);

  return (
    <Layout title={`${drug.drug_name.toUpperCase()} INTELLIGENCE`}>
      <div className="space-y-10 pb-20 animate-safemed-fadein">

        {/* Global Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-8">
          <button onClick={() => navigate(-1)}
            className="glass-button !bg-transparent !border-none !px-0 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-bold text-slate-600 dark:text-slate-400">Back to Intelligence Stream</span>
          </button>
          
          <div className="flex flex-wrap gap-3">
             <button
              onClick={() => navigate(`/officer/interaction`, { state: { drugA: drug.drug_name } })}
              className="glass-button font-bold text-xs"
            >
              <Zap className="w-4 h-4" /> Check Interactions
            </button>
            <button
              onClick={() => navigate(`/officer/report/${drug.drug_name}`)}
              className="btn-premium flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Generate Full Report
            </button>
            <button
              onClick={() => navigate('/officer/chatbot', { state: { drugContext: drug.drug_name } })}
              className="glass-button bg-brand-blue/10 border-brand-blue/30 text-brand-blue font-bold text-xs"
            >
              <Bot className="w-4 h-4" /> AI Analyst
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="clinical-card border-l-8 border-brand-blue relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
             <FlaskConical className="w-64 h-64 text-brand-blue" />
          </div>
          <div className="flex flex-col lg:flex-row gap-12 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-brand-blue/10 border border-brand-blue/20 rounded-[2rem] flex items-center justify-center text-4xl shadow-glow-blue/10 group-hover:scale-110 transition-transform">
                  <Pill className="w-12 h-12 text-brand-blue" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-6xl font-black text-slate-900 dark:text-white capitalize tracking-tighter leading-tight">
                      {drug.drug_name}
                    </h1>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                      drug.risk_level === 'critical' ? 'bg-brand-red/10 border-brand-red/20 text-brand-red' : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                    }`}>
                      {drug.risk_level} Risk
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-slate-500 font-mono text-[10px] tracking-[0.2em] uppercase">ID: STRAT-PV-{drug.id?.toString().padStart(5, '0')}</span>
                     <span className="w-1 h-1 rounded-full bg-slate-500" />
                     <span className="text-slate-500 font-mono text-[10px] tracking-[0.2em] uppercase flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {drug.total_reports?.toLocaleString()} FDA Reports
                     </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-blue">
                   <BrainCircuit className="w-4 h-4" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">AI Risk Explanation</span>
                </div>
                <p className="text-lg text-slate-700 dark:text-white/80 font-medium leading-relaxed italic max-w-4xl border-l-2 border-brand-blue/30 pl-6">
                  "{drug.explanation}"
                </p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-white/5 p-10 rounded-[2.5rem] border border-black/5 dark:border-white/10 flex flex-col items-center justify-center min-w-[280px]">
              <RiskRing score={drug.risk_score} size={160} />
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-6">Clinical Risk Index</div>
              <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${drug.risk_score > 70 ? 'bg-brand-red' : drug.risk_score > 40 ? 'bg-brand-amber' : 'bg-brand-emerald'}`} 
                  style={{ width: `${drug.risk_score}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {[
             { label: 'Strongest ROR', value: `${drug.strongest_ror}x`, icon: Activity, color: 'text-brand-blue', sub: 'Signal Intensity' },
             { label: 'Death Rate', value: `${drug.death_rate}%`, icon: AlertTriangle, color: 'text-brand-red', sub: 'Critical Severity' },
             { label: 'Serious Rate', value: `${drug.serious_rate}%`, icon: ShieldAlert, color: 'text-brand-amber', sub: 'Systemic Risk' },
             { label: 'Signal Count', value: drug.signal_count, icon: Database, color: 'text-brand-cyan', sub: 'Neural Clusters' },
           ].map((metric) => (
             <div key={metric.label} className="clinical-card flex flex-col items-center justify-center text-center p-8 group hover:border-brand-blue/30 transition-all">
                <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-white/5 mb-4 group-hover:scale-110 transition-transform ${metric.color}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">{metric.value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{metric.sub}</p>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Section title="Drug Indications" icon={Search} subtitle="Clinical Usage & FDA Approved Scope">
                <div className="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-black/5 dark:border-white/5">
                   <p className="text-slate-700 dark:text-white/80 leading-relaxed text-xs font-medium">{drug.uses}</p>
                </div>
              </Section>
              <Section title="Clinical Dosage" icon={Stethoscope} subtitle="Administration & Protocol">
                <div className="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-black/5 dark:border-white/5">
                   <p className="text-slate-700 dark:text-white/80 leading-relaxed text-xs font-medium">{drug.dosage}</p>
                </div>
              </Section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Section title="Pros (Clinical Benefit)" icon={ThumbsUp} subtitle="Clinical Studies & Efficacy">
                <div className="bg-brand-emerald/5 border-2 border-brand-emerald/10 p-6 rounded-2xl">
                   <p className="text-slate-700 dark:text-white/80 leading-relaxed text-xs font-medium italic">
                     {drug.pros}
                   </p>
                </div>
              </Section>
              <Section title="Cons (Adverse Profile)" icon={ThumbsDown} subtitle="Warnings & Common Reactions">
                <div className="bg-brand-red/5 border-2 border-brand-red/10 p-6 rounded-2xl">
                   <p className="text-slate-700 dark:text-white/80 leading-relaxed text-xs font-medium italic">
                     {drug.cons}
                   </p>
                </div>
              </Section>
            </div>

            <Section title="ROR Signal Detection Matrix" icon={Activity} subtitle="Confirmed disproportionality clusters (FAERS Analysis)">
              <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/5 mt-6">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-white/5">
                    <tr>
                      <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reaction Node</th>
                      <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">ROR Vector</th>
                      <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Intensity</th>
                      <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {drug.ror_signals?.map((sig, i) => (
                      <tr key={i} className="hover:bg-brand-blue/[0.02] transition-colors group">
                        <td className="p-5">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{sig.reaction}</span>
                              <span className="text-[9px] text-slate-500 font-mono mt-1">CI: {sig.ci_lower} - {sig.ci_upper}</span>
                           </div>
                        </td>
                        <td className="p-5 text-center">
                           <div className="flex items-center justify-center gap-1">
                              <span className="font-black text-brand-blue text-xl tracking-tighter">{sig.ror}</span>
                              <span className="text-[10px] font-bold text-slate-500">x</span>
                           </div>
                        </td>
                        <td className="p-5 text-center">
                           <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${signalBadge(sig.signal, sig.confirmed)}`}>
                             {sig.signal}
                           </span>
                        </td>
                        <td className="p-5 text-right">
                           <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              {sig.confirmed ? (
                                <><ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" /> Validated</>
                              ) : (
                                <><Clock className="w-3.5 h-3.5" /> Pending</>
                              )}
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {drug.yearly_trends?.length > 0 && (
              <Section title="Yearly Signal Momentum" icon={TrendingUp} subtitle="Temporal distribution of adverse reporting clusters">
                <div className="h-[350px] mt-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={drug.yearly_trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis dataKey="year" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} fontWeight={700} />
                      <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} fontWeight={700} />
                      <Tooltip 
                         contentStyle={{ 
                            background: 'var(--card-bg)', 
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(12px)'
                         }} 
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                      <Line type="monotone" name="Total Reports" dataKey="report_count" stroke="#2563EB" strokeWidth={4} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 8 }} />
                      <Line type="monotone" name="Serious Signals" dataKey="serious_count" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-10">
            <Section title="Who Should Avoid" icon={ShieldAlert} subtitle="Critical Contraindications">
               <div className="bg-brand-red/10 border-2 border-brand-red/20 p-8 rounded-[2rem] relative overflow-hidden group">
                 <AlertTriangle className="absolute -top-4 -right-4 w-24 h-24 text-brand-red opacity-10 group-hover:scale-125 transition-transform" />
                 <p className="text-slate-900 dark:text-white text-sm font-bold leading-relaxed italic relative z-10">"{drug.who_should_avoid}"</p>
               </div>
            </Section>

            <Section title="Gender Distribution" icon={Users} subtitle="Signal variance by sex node">
               <div className="space-y-6 mt-4">
                  {Object.entries(drug.gender_distribution || {}).map(([label, value]) => (
                    <ProgressBar key={label} label={label || 'Unknown'} value={value} max={genderMax} color={label?.toLowerCase().includes('female') ? 'bg-pink-500' : 'bg-brand-blue'} />
                  ))}
               </div>
            </Section>

            <Section title="Age Stratification" icon={BarChart3} subtitle="Risk momentum by age cluster">
               <div className="space-y-6 mt-4">
                  {Object.entries(drug.age_distribution || {}).sort().map(([label, value]) => (
                    <ProgressBar key={label} label={label || 'Unknown'} value={value} max={ageMax} color="bg-brand-cyan" />
                  ))}
               </div>
            </Section>

            <Section title="Evidence Sources" icon={Database} subtitle="Source Node Integrity">
               <div className="space-y-4">
                 {[
                   { label: 'FDA Official Label', active: !!drug.evidence?.fda_label, icon: FileText, sub: 'Synced matrix' },
                   { label: 'PubMed Archive', value: `${drug.evidence?.pubmed_count} Papers`, icon: Search, sub: 'Clinical literature' },
                   { label: 'Global FAERS Node', value: `${drug.evidence?.faers_reports?.toLocaleString()} Signals`, icon: MapPin, sub: 'Surveillance data' },
                 ].map(e => (
                   <div key={e.label} className="flex justify-between items-center p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 group hover:border-brand-blue/20 transition-all">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                          <e.icon className="w-4 h-4 text-brand-blue" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest block">{e.label}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{e.sub}</span>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-brand-cyan uppercase tracking-tighter">{e.value || (e.active ? 'CONNECTED' : 'NULL')}</span>
                   </div>
                 ))}
               </div>
            </Section>

            <Section title="Safer Alternatives" icon={Shield} subtitle="Low-Risk Cluster Substitutes">
               <div className="space-y-4">
                 {drug.alternatives?.length > 0 ? drug.alternatives?.map(alt => (
                   <div 
                    key={alt.drug_name}
                    onClick={() => navigate(`/officer/drug/${alt.drug_name}`)}
                    className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 hover:border-brand-emerald/40 cursor-pointer transition-all group"
                   >
                     <div className="flex justify-between items-center mb-3">
                       <span className="text-sm font-black text-slate-900 dark:text-white capitalize group-hover:text-brand-emerald">{alt.drug_name}</span>
                       <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                          alt.risk_level === 'low' ? 'text-brand-emerald border-brand-emerald/20 bg-brand-emerald/10' : 'text-brand-blue border-brand-blue/20 bg-brand-blue/10'
                       }`}>
                          {alt.risk_level} Risk
                       </span>
                     </div>
                     <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-brand-emerald h-full" style={{ width: `${100 - alt.risk_score}%` }} />
                     </div>
                     <p className="text-[9px] text-slate-500 font-mono mt-3 uppercase tracking-widest">Safety Index: {100 - alt.risk_score}%</p>
                   </div>
                 )) : (
                   <p className="text-center text-slate-600 text-[10px] py-10 uppercase tracking-[0.3em] font-black">No safer nodes identified</p>
                 )}
               </div>
            </Section>

            <div className="clinical-card bg-brand-blue text-white overflow-hidden relative group p-10">
               <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-150 transition-transform duration-1000">
                  <BrainCircuit className="w-48 h-48" />
               </div>
               <h4 className="text-xl font-black uppercase tracking-tighter mb-4 relative z-10">Ask AI about this drug</h4>
               <p className="text-xs text-white/80 leading-relaxed font-bold mb-8 relative z-10">Access neural-linked clinical intelligence for deep-dive analysis on interaction profiles and ADR signals.</p>
               <button 
                  onClick={() => navigate('/officer/chatbot', { state: { drugContext: drug.drug_name } })}
                  className="bg-white text-brand-blue w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl relative z-10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
               >
                  <Bot className="w-4 h-4" /> Launch Chatbot Context
               </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
