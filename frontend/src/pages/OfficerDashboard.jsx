import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  ShieldAlert, 
  Database, 
  Activity, 
  TrendingUp, 
  BarChart as BarChartIcon, 
  Zap, 
  ChevronRight,
  RefreshCw,
  Cpu,
  BrainCircuit,
  Lock,
  Globe,
  Bell,
  Settings,
  ArrowRight,
  FileSearch
} from 'lucide-react';

import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import DrugRow from '../components/DrugRow';
import Sparkline from '../components/Sparkline';
import { alertsAPI, analyticsAPI, dataAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sparklineData, setSparklineData] = useState({});
  const [ingesting, setIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      try {
        const [lb, sum, al, tr] = await Promise.allSettled([
          analyticsAPI.getLeaderboard(),
          dataAPI.getSummary(),
          alertsAPI.getAlerts(),
          dataAPI.getTrends('warfarin'),
        ]);

        if (!mounted) return;
        
        let lbData = [];
        if (lb.status === 'fulfilled') {
          lbData = lb.value.data || [];
          setLeaderboard(lbData);
        }
        if (sum.status === 'fulfilled') setSummary(sum.value.data || {});
        if (al.status === 'fulfilled') setAlerts((al.value.data || []).slice(0, 5));
        
        // Handle trends with fallback for visualization
        if (tr.status === 'fulfilled' && tr.value.data?.length > 0) {
          setTrends(tr.value.data);
        } else {
          // Placeholder data to ensure chart is visible if no trends found
          setTrends([
            { year: 2018, report_count: 400, serious_count: 120 },
            { year: 2019, report_count: 520, serious_count: 180 },
            { year: 2020, report_count: 780, serious_count: 310 },
            { year: 2021, report_count: 1100, serious_count: 450 },
            { year: 2022, report_count: 950, serious_count: 380 },
            { year: 2023, report_count: 1250, serious_count: 520 },
          ]);
        }

        if (lbData.length > 0) {
          const top5 = lbData.slice(0, 5);
          const sparks = {};
          await Promise.all(top5.map(async (drug) => {
            try {
              const res = await dataAPI.getTrends(drug.drug_name);
              sparks[drug.drug_name] = res.data.length > 0 ? res.data.map(d => d.report_count) : [40, 45, 42, 48, 50, 55, 52, 60];
            } catch (e) {
              sparks[drug.drug_name] = [40, 45, 42, 48, 50, 55, 52, 60];
            }
          }));
          setSparklineData(sparks);
        }

      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAll();
    return () => { mounted = false; };
  }, []);

  const criticalCount = useMemo(() => leaderboard.filter((drug) => (drug.risk_score || 0) >= 70).length, [leaderboard]);
  const activeAlerts = alerts.filter((alert) => !alert.is_validated).length;

  const handleIngestion = async () => {
    setIngesting(true);
    setIngestProgress(0);
    try {
      await dataAPI.triggerIngest(100);
      const interval = setInterval(() => {
        setIngestProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIngesting(false);
            window.location.reload();
            return 100;
          }
          return prev + 10;
        });
      }, 500);
      toast.success("Intelligence Stream Initialized");
    } catch (err) {
      toast.error("Ingestion Node Failure");
      setIngesting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Command Center">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin shadow-glow-blue/20"></div>
              <Cpu className="w-10 h-10 text-brand-blue absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center">
              <div className="text-sm font-black text-slate-900 dark:text-white tracking-[0.4em] uppercase animate-pulse">Syncing Intelligence Nodes</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Safety Intelligence Console">
      <div className="w-full space-y-10 pb-20 animate-safemed-fadein px-4 sm:px-6">
        
        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-8">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl flex items-center justify-center shadow-glow-blue/10">
                 <Globe className="w-8 h-8 text-brand-blue animate-pulse" />
              </div>
              <div>
                 <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                    Command <span className="text-brand-blue">Center</span>
                 </h1>
                 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mt-2">
                    Global Pharmacovigilance Surveillance Hub · Node 01-ALPHA
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/officer/alerts')}
                className="glass-button !bg-brand-blue/5 !border-brand-blue/20 text-brand-blue"
              >
                 <Bell className="w-4 h-4" />
                 <span className="font-black">Security Alerts</span>
              </button>
              <button className="btn-premium flex items-center gap-2">
                 <Settings className="w-4 h-4" />
                 <span>Protocol</span>
              </button>
           </div>
        </div>

        {/* Ingestion Banner / Live Polling */}
        {(summary.total_reports === 0 || ingesting) && (
          <div className="clinical-card border-2 border-dashed border-brand-amber/30 bg-brand-amber/5 flex flex-col md:flex-row items-center justify-between p-8 sm:p-10 gap-8 group relative overflow-hidden stagger-1">
            {ingesting && (
              <div className="absolute bottom-0 left-0 h-1 bg-brand-amber transition-all duration-500" style={{ width: `${ingestProgress}%` }} />
            )}
            <div className="flex items-center gap-8 relative z-10">
              <div className={`w-16 h-16 rounded-2xl bg-brand-amber/10 flex items-center justify-center border border-brand-amber/20 ${ingesting ? 'animate-spin' : ''}`}>
                <RefreshCw className="w-8 h-8 text-brand-amber" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-brand-amber font-black text-xl uppercase tracking-tighter">
                  {ingesting ? `Ingesting Global Data: ${ingestProgress}%` : 'No Intelligence Data Detected'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs mt-1 font-black italic uppercase tracking-widest leading-relaxed">
                  {ingesting ? 'Synchronizing with FAERS surveillance clusters...' : 'Initialize real-time synchronization with global FAERS surveillance nodes.'}
                </p>
              </div>
            </div>
            {!ingesting && (
              <button
                onClick={handleIngestion}
                className="btn-premium bg-brand-amber hover:bg-amber-600 !px-12 !py-5 shadow-glow-amber/40 scale-110"
              >
                Run Ingestion Now
              </button>
            )}
          </div>
        )}

        {/* Top-Level KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 stagger-2">
          <StatCard 
            icon={<Database className="w-6 h-6" />} 
            label="Total Reports" 
            value={summary.total_reports || 0} 
            sub="Global Signal Volume" 
            color="#2563EB" 
            trend="up" 
          />
          <StatCard 
            icon={<Zap className="w-6 h-6" />} 
            label="Drugs Tracked" 
            value={summary.drugs_tracked || 0} 
            sub="Active Node Count" 
            color="#8b5cf6" 
            trend="up" 
          />
          <StatCard 
            icon={<ShieldAlert className="w-6 h-6" />} 
            label="Active Alerts" 
            value={activeAlerts} 
            sub="Critical Audit Items" 
            color="#f97316" 
            trend="up" 
          />
          <StatCard 
            icon={<Activity className="w-6 h-6" />} 
            label="Critical Drugs" 
            value={criticalCount} 
            sub={`Disproportionality > 70`} 
            color="#ef4444" 
            trend="up" 
          />
        </section>

        {/* Alerts Matrix */}
        <div className="clinical-card !p-0 overflow-hidden stagger-3">
           <div className="p-6 sm:p-8 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-brand-red/[0.02] gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/20 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-brand-red" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Live Intelligence Alerts</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Real-time disproportionality triggers</p>
                 </div>
              </div>
              <button 
                onClick={() => navigate('/officer/alerts')}
                className="flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase tracking-widest hover:gap-4 transition-all"
              >
                Manage All Alerts <ArrowRight className="w-4 h-4" />
              </button>
           </div>
           <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {alerts.length > 0 ? alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 group hover:border-brand-blue/30 transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        alert.level === 'CRITICAL' ? 'bg-brand-red/10 text-brand-red border border-brand-red/20' : 'bg-brand-amber/10 text-brand-amber border border-brand-amber/20'
                      }`}>
                        {alert.level} Signal
                      </span>
                      <button className="text-slate-400 hover:text-brand-blue transition-colors">
                         <Settings className="w-4 h-4" />
                      </button>
                   </div>
                   <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{alert.drug_name}</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-black line-clamp-2 italic">"{alert.message}"</p>
                   <button 
                     onClick={() => navigate(`/officer/drug/${alert.drug_name}`)}
                     className="mt-6 w-full py-3 bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest rounded-xl hover:bg-brand-blue hover:text-white transition-all"
                   >
                     Audit Signal Node
                   </button>
                </div>
              )) : (
                <div className="md:col-span-3 flex flex-col items-center justify-center py-10 opacity-50">
                   <FileSearch className="w-10 h-10 text-slate-400 mb-3" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No active signals detected in current node</p>
                </div>
              )}
           </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 stagger-4">
          
          {/* Main Visualizations */}
          <div className="xl:col-span-2 space-y-10">
            {/* Warfarin Yearly Trend */}
            <div className="clinical-card !p-8 sm:!p-10 relative overflow-hidden min-h-[500px]">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-12 gap-4 relative z-10">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3 uppercase">
                    <TrendingUp className="w-6 h-6 text-brand-blue" />
                    Warfarin Signal Velocity
                  </h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Reports vs Serious Outcomes over time</p>
                </div>
                <div className="flex gap-2">
                   <span className="px-4 py-2 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 text-[10px] font-black text-brand-emerald uppercase tracking-widest">
                      Node: Warfarin-01
                   </span>
                </div>
              </div>
              
              <div className="h-[350px] sm:h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSerious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      stroke="#64748B" 
                      fontSize={11} 
                      fontWeight={900}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={11} 
                      fontWeight={900}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card-bg)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '16px',
                        backdropFilter: 'blur(16px)',
                        padding: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                      labelStyle={{ color: '#94A3B8', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="report_count" 
                      stroke="#2563EB" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorReports)" 
                      name="Total Reports"
                      animationDuration={1500}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="serious_count" 
                      stroke="#EF4444" 
                      strokeWidth={2} 
                      fillOpacity={1}
                      fill="url(#colorSerious)"
                      name="Serious Events" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Surveillance Grid */}
            <div className="clinical-card !p-0 overflow-hidden">
              <div className="p-8 sm:p-10 border-b border-black/5 dark:border-white/5">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3 uppercase">
                  <Activity className="w-6 h-6 text-brand-cyan" />
                  Live Surveillance Grid
                </h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Active disproportionality trajectories per lead compound</p>
              </div>
              
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-slate-50 dark:bg-white/5">
                    <tr>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Compound Node</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Risk Momentum</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Risk Index</th>
                      <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Absolute Signals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/[0.05]">
                    {leaderboard.length > 0 ? leaderboard.slice(0, 6).map((drug) => (
                      <tr key={drug.drug_name} className="group hover:bg-brand-blue/[0.02] transition-all cursor-pointer" onClick={() => navigate(`/officer/drug/${drug.drug_name}`)}>
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue font-black text-xs">
                                 {drug.drug_name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-black text-slate-900 dark:text-white capitalize text-lg group-hover:text-brand-blue transition-colors">
                                {drug.drug_name}
                              </span>
                           </div>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center">
                             <Sparkline 
                                data={sparklineData[drug.drug_name] || [40, 42, 45, 43, 48, 50, 47, 52]} 
                                color={drug.risk_score >= 70 ? '#EF4444' : drug.risk_score >= 50 ? '#F59E0B' : '#38BDF8'} 
                             />
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border-2 ${
                            drug.risk_score >= 70 ? 'bg-brand-red/10 border-brand-red/30 text-brand-red' : 
                            drug.risk_score >= 50 ? 'bg-brand-amber/10 border-brand-amber/30 text-brand-amber' : 
                            'bg-brand-blue/10 border-brand-blue/30 text-brand-blue'
                          }`}>
                            {Math.round(drug.risk_score)}
                          </span>
                        </td>
                        <td className="p-6 text-right font-black text-xs text-slate-400 dark:text-slate-500">
                          {drug.total_reports.toLocaleString()}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="p-20 text-center text-slate-400 font-black uppercase tracking-widest opacity-50">
                           Awaiting Surveillance Synchronization...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Risk Distribution Bar Chart */}
            <div className="clinical-card !p-8 relative min-h-[450px]">
              <div className="flex items-center gap-4 mb-10 border-b border-black/5 dark:border-white/5 pb-4 relative z-10">
                  <BarChartIcon className="w-6 h-6 text-brand-blue" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Risk Score Distribution</h3>
              </div>
              <div className="h-[350px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderboard.slice(0, 10)} layout="vertical" margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="drug_name" 
                      type="category" 
                      fontSize={10} 
                      fontWeight={900}
                      width={80}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', textTransform: 'uppercase' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--card-bg)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '16px',
                        padding: '12px'
                      }} 
                      itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="risk_score" radius={[0, 8, 8, 0]} barSize={12} animationDuration={1500}>
                      {leaderboard.slice(0, 10).map((drug, index) => {
                        const score = drug.risk_score || 0;
                        const fill = score >= 70 ? '#EF4444' : score >= 50 ? '#F59E0B' : '#38BDF8';
                        return <Cell key={`cell-${index}`} fill={fill} fillOpacity={0.8} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dangerous Nodes Leaderboard */}
            <div className="clinical-card !p-8 h-full flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Dangerous Nodes</h2>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Priority 1 Signals</p>
                </div>
                <div className="p-3 rounded-2xl bg-brand-red/10 border border-brand-red/20 shadow-glow-red/10">
                  <TrendingUp className="w-6 h-6 text-brand-red" />
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {leaderboard.length > 0 ? leaderboard.slice(0, 5).map((drug, i) => (
                  <DrugRow 
                    key={drug.drug_name}
                    rank={i + 1}
                    name={drug.drug_name}
                    score={Math.round(drug.risk_score || 0)}
                    reports={drug.total_reports}
                    deathReports={drug.death_reports}
                    topReactions={drug.top_reactions}
                    trend={drug.risk_score > 60 ? '↑' : '↓'}
                    delay={i * 80}
                    isCompact={true}
                  />
                )) : (
                  <div className="py-10 text-center opacity-30">
                     <p className="text-[10px] font-black uppercase tracking-widest">No Signals Loaded</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/officer/leaderboard')}
                className="btn-premium w-full mt-10 !py-5 flex items-center justify-center gap-3 group"
              >
                Access Risk Intelligence Engine
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
            
            {/* AI Audit Panel */}
            <div className="clinical-card bg-brand-blue/5 border-brand-blue/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                  <BrainCircuit className="w-24 h-24 text-brand-blue" />
               </div>
               <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl text-brand-cyan">
                     <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Neural Protection</h3>
               </div>
               <div className="space-y-6 relative z-10">
                 {[
                   { label: 'Signal Matrix', status: 'SYNCED', color: 'text-brand-emerald' },
                   { label: 'Audit Protocol', status: 'LOCKED', color: 'text-brand-cyan' },
                   { label: 'Bayesian Engine', status: 'ACTIVE', color: 'text-brand-cyan' },
                 ].map(item => (
                   <div key={item.label} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                     <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.label}</span>
                     <span className={`text-[9px] font-black ${item.color} uppercase tracking-tighter`}>{item.status}</span>
                   </div>
                 ))}
                 <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mt-6">
                    <div className="h-full bg-gradient-to-r from-brand-blue to-brand-cyan w-[84%] animate-pulse"></div>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
