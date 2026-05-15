import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import { 
  Bot, Zap, ArrowLeft, Pill, FileText, Activity, 
  AlertTriangle, CheckCircle, ShieldAlert, ChevronRight,
  Database, Search, FlaskConical, Dna, History,
  Info, Download, Shield, Users, BarChart3, TrendingUp
} from 'lucide-react'
import Layout from '../components/Layout'
import api, { downloadsAPI, analyticsAPI } from '../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'

const signalBadge = (sig, confirmed) => {
  if (!confirmed) return 'text-surface-500 bg-white/5 border-white/10'
  if (sig === 'strong')   return 'text-brand-red bg-brand-red/10 border-brand-red/20 shadow-glow-red/5'
  if (sig === 'moderate') return 'text-brand-amber bg-brand-amber/10 border-brand-amber/20'
  return                         'text-brand-blue bg-brand-blue/10 border-brand-blue/20'
}

function Section({ title, icon: Icon, children, className = "", subtitle = "" }) {
  return (
    <div className={`clinical-card ${className}`}>
      <div className="flex items-center justify-between mb-8 border-b border-white/[0.05] pb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-brand-blue shadow-glow-blue/10">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
              {title}
            </h3>
            {subtitle && <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
      {children}
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

  const generatePDF = async (mode = 'save') => {
    if (!drug) return;

    try {
      const toastId = toast.loading(`${mode === 'save' ? 'Downloading' : 'Opening'} Intelligence Report...`);
      
      let rank = 'N/A';
      try {
        const lbRes = await analyticsAPI.getLeaderboard();
        const foundIndex = lbRes.data.findIndex(d => d.drug_name.toLowerCase() === drug.drug_name.toLowerCase());
        if (foundIndex !== -1) rank = foundIndex + 1;
      } catch (lbErr) {
        console.warn("Leaderboard fetch failed", lbErr);
      }

      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Premium Header
      doc.setFillColor(11, 18, 32);
      doc.rect(0, 0, 210, 50, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("SafeMedAI Intelligence", 15, 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("CONFIDENTIAL PHARMACOVIGILANCE AUDIT REPORT", 15, 35);
      doc.text(`Reference: NODE-PV-${drug.id || 'AUTO'} | Generated: ${timestamp}`, 15, 42);

      // Hero Section
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(32);
      doc.text(drug.drug_name.toUpperCase(), 15, 75);
      
      doc.setFontSize(14);
      doc.text(`Leadership Rank: #${rank} Global Intelligence`, 15, 85);
      doc.setTextColor(drug.risk_level === 'critical' ? 239 : 37, drug.risk_level === 'critical' ? 68 : 99, drug.risk_level === 'critical' ? 68 : 235);
      doc.text(`Global Risk Index: ${drug.risk_score}/100 [${drug.risk_level.toUpperCase()} PRIORITY]`, 15, 95);

      // Section: Core Safety Matrix
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(18);
      doc.text("Safety Surveillance Matrix", 15, 115);
      doc.line(15, 118, 195, 118);

      const metricsData = [
        ["Surveillance Node", "Value", "Clinical Significance"],
        ["Total Signal Volume", drug.total_reports || '0', "Absolute FAERS report volume"],
        ["Disproportionality Vector (ROR)", `${drug.strongest_ror || '0'}x`, "Max signal intensity cluster"],
        ["Fatal Outcome Velocity", `${drug.death_rate || '0'}%`, "Frequency of lethal events"],
        ["Serious Event Momentum", `${drug.serious_rate || '0'}%`, "Frequency of life-threatening events"],
        ["Neural Signal Clusters", drug.signal_count || '0', "Validated disproportionality nodes"]
      ];

      autoTable(doc, {
        startY: 125,
        head: [metricsData[0]],
        body: metricsData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [11, 18, 32], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });

      let finalY = (doc).lastAutoTable?.finalY || 180;

      // Section: Disproportionality Signals
      doc.setFontSize(18);
      doc.text("Adverse Reaction Disproportionality (ROR)", 15, finalY + 20);
      
      const rorTableData = (drug.ror_signals || []).map(s => [
        s.reaction.toUpperCase(),
        s.ror,
        `${s.ci_lower} - ${s.ci_upper}`,
        (s.signal || 'LOW').toUpperCase(),
        s.confirmed ? "VALIDATED" : "PROVISIONAL"
      ]);

      if (rorTableData.length > 0) {
        autoTable(doc, {
          startY: finalY + 25,
          head: [["Reaction Node", "ROR", "95% Confidence Interval", "Signal Power", "Status"]],
          body: rorTableData,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] }
        });
      } else {
        doc.setFontSize(10);
        doc.text("No specific ADR clusters detected in current surveillance cycle.", 15, finalY + 30);
        doc.lastAutoTable = { finalY: finalY + 35 };
      }

      finalY = (doc).lastAutoTable?.finalY || 240;

      // Add New Page for Context
      doc.addPage();
      doc.setFillColor(11, 18, 32);
      doc.rect(0, 0, 210, 15, 'F');
      
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(18);
      doc.text("Clinical Intelligence Context", 15, 30);
      doc.line(15, 33, 195, 33);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Therapeutic Intent:", 15, 45);
      doc.setFont("helvetica", "normal");
      const splitUses = doc.splitTextToSize(drug.uses || 'N/A', 180);
      doc.text(splitUses, 15, 52);
      
      let nextY = 52 + (splitUses.length * 6);
      doc.setFont("helvetica", "bold");
      doc.text("Risk Mitigation & Contraindications:", 15, nextY + 5);
      doc.setFont("helvetica", "normal");
      const splitAvoid = doc.splitTextToSize(drug.who_should_avoid || 'N/A', 180);
      doc.text(splitAvoid, 15, nextY + 12);

      nextY = nextY + 12 + (splitAvoid.length * 6);
      
      // Demographics Table
      doc.setFontSize(18);
      doc.text("Demographic Distribution", 15, nextY + 20);
      doc.line(15, nextY + 23, 195, nextY + 23);

      const genderData = Object.entries(drug.gender_distribution || {}).map(([k, v]) => [k || 'Unknown', v]);
      const ageData = Object.entries(drug.age_distribution || {}).map(([k, v]) => [k || 'Unknown', v]);

      autoTable(doc, {
        startY: nextY + 30,
        head: [["Gender Group", "Report Count"]],
        body: genderData,
        theme: 'plain',
        tableWidth: 90,
        margin: { left: 15 }
      });

      autoTable(doc, {
        startY: nextY + 30,
        head: [["Age Group", "Report Count"]],
        body: ageData,
        theme: 'plain',
        tableWidth: 90,
        margin: { left: 110 }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`SafeMedAI Intelligence Platform | Protected Clinical Data | Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      if (mode === 'save') {
        doc.save(`SafeMedAI_Intelligence_${drug.drug_name}_${new Date().getTime()}.pdf`);
        try { await downloadsAPI.recordDownload(drug.drug_name); } catch (e) {}
      } else {
        window.open(doc.output('bloburl'), '_blank');
      }
      
      toast.dismiss(toastId);
      toast.success('Clinical Intelligence Report Generated');
    } catch (err) {
      console.error("PDF synthesis node failure:", err);
      toast.error('Clinical report synthesis failure.');
    }
  };

  if (loading) return (
    <Layout title="Initializing Intelligence Matrix">
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="w-16 h-16 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin shadow-glow-blue/20"></div>
        <div className="text-center">
          <p className="text-[11px] font-black text-brand-blue uppercase tracking-[0.3em] animate-pulse">Synchronizing Neural Data Clusters</p>
          <p className="text-[9px] text-surface-500 uppercase tracking-widest mt-2">Connecting to Global Surveillance Grid...</p>
        </div>
      </div>
    </Layout>
  )

  if (error || !drug) return (
    <Layout title="Node Breach">
      <div className="max-w-2xl mx-auto mt-20">
        <div className="clinical-card !p-12 text-center border-brand-red/30 bg-brand-red/5">
          <ShieldAlert className="w-16 h-16 text-brand-red mx-auto mb-8" />
          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">Signal Retrieval Error</h2>
          <p className="text-surface-500 text-sm mb-10">{error || 'Data cluster unreachable'}</p>
          <button onClick={() => navigate(-1)} className="btn-premium px-10">Abort Connection</button>
        </div>
      </div>
    </Layout>
  )

  const genderChartData = Object.entries(drug.gender_distribution || {}).map(([name, value]) => ({ name, value }));
  const ageChartData = Object.entries(drug.age_distribution || {}).map(([name, value]) => ({ name, value }));

  return (
    <Layout title={`${drug.drug_name.toUpperCase()} INTELLIGENCE`}>
      <div className="space-y-10 pb-20 animate-safemed-fadein">

        {/* Global Navigation */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <button onClick={() => navigate(-1)}
            className="glass-button !bg-transparent !border-none !px-0 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Intelligence Stream
          </button>
          
          <div className="flex flex-wrap gap-3">
             <button
              onClick={() => navigate(`/officer/report/${drug.drug_name}`)}
              className="glass-button"
            >
              <BarChart3 className="w-4 h-4" /> Analytics Matrix
            </button>
            <button
              onClick={() => generatePDF('save')}
              className="btn-premium !py-3 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Intelligence
            </button>
            <button
              onClick={() => navigate('/officer/chatbot', { state: { drugContext: drug.drug_name } })}
              className="glass-button bg-brand-blue/10 border-brand-blue/30 text-brand-blue"
            >
              <Bot className="w-4 h-4" /> AI Analyst
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="clinical-card border-l-4 border-brand-blue relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
             <FlaskConical className="w-64 h-64 text-brand-blue" />
          </div>
          <div className="flex flex-col lg:flex-row gap-12 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-brand-blue/10 border border-brand-blue/20 rounded-3xl flex items-center justify-center text-4xl shadow-glow-blue/10 group-hover:scale-110 transition-transform">
                  <Pill className="w-10 h-10 text-brand-blue" />
                </div>
                <div>
                  <h1 className="text-6xl font-black text-white capitalize tracking-tighter leading-tight">
                    {drug.drug_name}
                  </h1>
                  <p className="text-surface-500 font-mono text-[10px] tracking-[0.2em] uppercase mt-2">Clinical Compound Identifier: STRAT-PV-{drug.id}</p>
                </div>
              </div>
              <p className="text-lg text-white/80 font-medium leading-relaxed italic max-w-4xl">
                "{drug.explanation}"
              </p>
            </div>
            
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col items-center">
              <div className="text-5xl font-black text-brand-blue tracking-tighter mb-1">{drug.risk_score}</div>
              <div className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-4">Risk Profile Index</div>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                drug.risk_level === 'critical' ? 'bg-brand-red/10 border-brand-red/20 text-brand-red' : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
              }`}>
                {drug.risk_level} Priority
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-10">
            
            {/* Demographic Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Section title="Gender Variance" icon={Users} subtitle="Signal distribution by gender nodes">
                 <div className="h-[250px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderChartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {genderChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#2563EB' : index === 1 ? '#EC4899' : '#94A3B8'} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </Section>
              <Section title="Age Stratification" icon={BarChart3} subtitle="Risk momentum across age clusters">
                 <div className="h-[250px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Bar dataKey="value" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </Section>
            </div>

            <Section title="Clinical Utilization" icon={Search} subtitle="Approved Indications & Protocol">
               <p className="text-white/80 leading-relaxed text-sm font-medium">{drug.uses}</p>
            </Section>

            <Section title="Disproportionality Vector Table" icon={Activity} subtitle="Confirmed ADR signal clusters (ROR Analysis)">
              <div className="overflow-hidden rounded-xl border border-white/5 mt-6">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="p-4 text-[10px] font-black text-surface-500 uppercase tracking-widest">Reaction Node</th>
                      <th className="p-4 text-[10px] font-black text-surface-500 uppercase tracking-widest">ROR Vector</th>
                      <th className="p-4 text-[10px] font-black text-surface-500 uppercase tracking-widest text-center">Protocol Intensity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {drug.ror_signals?.map((sig, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 text-sm font-bold text-white capitalize">{sig.reaction}</td>
                        <td className="p-4 font-black text-brand-blue text-lg">{sig.ror}</td>
                        <td className="p-4 text-center">
                           <span className={`text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${signalBadge(sig.signal, sig.confirmed)}`}>
                             {sig.signal}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {drug.yearly_trends?.length > 0 && (
              <Section title="Temporal Momentum" icon={TrendingUp} subtitle="Historical signal velocity matrix">
                <div className="h-[300px] mt-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={drug.yearly_trends}>
                      <defs>
                        <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Area type="monotone" dataKey="report_count" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRep)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-10">
            <Section title="Node Protection" icon={ShieldAlert} subtitle="Safety Warnings">
               <div className="bg-brand-red/10 border border-brand-red/20 p-6 rounded-2xl">
                 <p className="text-white text-xs font-bold leading-relaxed italic">"{drug.who_should_avoid}"</p>
               </div>
            </Section>

            <Section title="Evidence Clusters" icon={Database} subtitle="Source Node Status">
               <div className="space-y-4">
                 {[
                   { label: 'FDA Label Matrix', active: !!drug.evidence?.fda_label },
                   { label: 'PubMed Archive', value: `${drug.evidence?.pubmed_count} Artifacts` },
                   { label: 'Global FAERS Node', value: `${drug.evidence?.faers_reports?.toLocaleString()} Signals` },
                 ].map(e => (
                   <div key={e.label} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                     <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{e.label}</span>
                     <span className="text-[10px] font-black text-brand-cyan uppercase tracking-tighter">{e.value || (e.active ? 'SYNCED' : 'NULL')}</span>
                   </div>
                 ))}
               </div>
            </Section>

            <Section title="Comparative Nodes" icon={Shield} subtitle="Safer Cluster Alternatives">
               <div className="space-y-4">
                 {drug.alternatives?.map(alt => (
                   <div 
                    key={alt.drug_name}
                    onClick={() => navigate(`/officer/drug/${alt.drug_name}`)}
                    className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-blue/40 cursor-pointer transition-all group"
                   >
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-black text-white capitalize group-hover:text-brand-blue">{alt.drug_name}</span>
                       <span className="text-[9px] font-black text-brand-blue uppercase">{alt.risk_level} Risk</span>
                     </div>
                     <p className="text-[10px] text-surface-500 font-mono">Safety Index: {alt.risk_score}%</p>
                   </div>
                 ))}
               </div>
            </Section>
          </div>
        </div>
      </div>
    </Layout>
  )
}
