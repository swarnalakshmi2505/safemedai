import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { 
  ShieldAlert, 
  BarChart as BarChartIcon, 
  TrendingUp, 
  Activity, 
  ChevronRight, 
  Cpu, 
  Filter, 
  ArrowDownNarrowWide, 
  Database, 
  AlertCircle, 
  Shield,
  Layers,
  Zap
} from 'lucide-react';

import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import DrugRow from '../components/DrugRow';
import { analyticsAPI, dataAPI } from '../services/api';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([analyticsAPI.getLeaderboard(), dataAPI.getSummary()])
      .then(([leaderboardResponse, summaryResponse]) => {
        if (!mounted) return;
        setLeaderboard(leaderboardResponse.data || []);
        setSummary(summaryResponse.data || {});
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const criticalCount = useMemo(() => leaderboard.filter((drug) => (drug.risk_score || 0) >= 70).length, [leaderboard]);
  
  const radarData = useMemo(() => {
    return leaderboard.slice(0, 6).map(drug => ({
      subject: drug.drug_name.charAt(0).toUpperCase() + drug.drug_name.slice(1, 10),
      A: drug.risk_score,
      fullMark: 100,
    }));
  }, [leaderboard]);

  if (loading) {
    return (
      <Layout title="Risk Hub">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin shadow-glow-blue/20"></div>
              <BarChartIcon className="absolute inset-0 m-auto w-8 h-8 text-brand-blue animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-brand-blue uppercase tracking-[0.4em] animate-pulse">Calibrating Risk Matrix</p>
              <p className="text-[10px] text-surface-500 mt-2 font-black tracking-widest uppercase italic">Aggregating global signal clusters...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Risk Intelligence Hub">
      <div className="max-w-[1600px] mx-auto space-y-12 pb-20 animate-safemed-fadein">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-black/5 dark:border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-red/10 border border-brand-red/20 rounded-[2rem] flex items-center justify-center shadow-glow-red/10">
              <ShieldAlert className="w-8 h-8 text-brand-red animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                 Risk <span className="text-brand-red">Intelligence Matrix</span>
              </h1>
              <p className="text-[10px] text-surface-500 font-black uppercase tracking-[0.3em] mt-3">
                Prioritization hierarchy of lead compounds by global disproportionality metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="glass-button font-black text-xs">
              <Filter className="w-4 h-4" />
              <span>Filter Matrix</span>
            </button>
            <button
              onClick={() => navigate('/officer/alerts')}
              className="btn-premium bg-brand-blue !px-8 !py-4"
            >
              Audit Active Signals
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-1">
          <StatCard 
            icon={<Database className="w-6 h-6" />} 
            label="Clusters Analyzed" 
            value={summary.total_reports || 0} 
            color="#38BDF8" 
            trend="up" 
            sub="Global Surveillance Nodes" 
          />
          <StatCard 
            icon={<Shield className="w-6 h-6" />} 
            label="Nodes Tracked" 
            value={summary.drugs_tracked || 0} 
            color="#8b5cf6" 
            trend="up" 
            sub="Compound Evidence Links" 
          />
          <StatCard 
            icon={<Zap className="w-6 h-6" />} 
            label="Critical Risks" 
            value={criticalCount} 
            color="#ef4444" 
            trend="up" 
            sub="Priority Validation Required" 
          />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 stagger-2">
          {/* Main List */}
          <div className="xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2 mb-4">
              <h2 className="text-[11px] font-black text-surface-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <ArrowDownNarrowWide className="w-5 h-5 text-brand-blue" />
                Intelligence Ranking Matrix
              </h2>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
                 <span className="text-[9px] font-black text-brand-emerald uppercase tracking-widest">Real-time Stream</span>
              </div>
            </div>
            <div className="space-y-4">
              {leaderboard.slice(0, 10).map((drug, i) => (
                <DrugRow 
                  key={drug.drug_name}
                  rank={i + 1}
                  name={drug.drug_name}
                  score={Math.round(drug.risk_score || 0)}
                  reports={drug.total_reports}
                  deathReports={drug.death_reports}
                  topReactions={drug.top_reactions}
                  trend={drug.risk_score > 60 ? '↑' : '↓'}
                  delay={i * 60}
                />
              ))}
            </div>
          </div>

          {/* Side Visualizations */}
          <div className="xl:col-span-4 space-y-10">
            <div className="clinical-card !p-10">
               <div className="flex items-center gap-4 mb-10 border-b border-black/5 dark:border-white/5 pb-4">
                  <Activity className="w-6 h-6 text-brand-cyan" />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Signal Cluster Radar</h3>
               </div>
               <div className="h-[350px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="rgba(0,0,0,0.05)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontWeight: '900', letterSpacing: '0.05em' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Risk Node"
                        dataKey="A"
                        stroke="#2563EB"
                        strokeWidth={3}
                        fill="#2563EB"
                        fillOpacity={0.2}
                      />
                      <Tooltip 
                         contentStyle={{ 
                            background: 'var(--card-bg)', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '16px',
                            backdropFilter: 'blur(16px)',
                            padding: '12px'
                         }} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="clinical-card !p-10">
              <div className="flex items-center gap-4 mb-10 border-b border-black/5 dark:border-white/5 pb-4">
                  <BarChartIcon className="w-6 h-6 text-brand-blue" />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Intensity Magnitude</h3>
              </div>
              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderboard.slice(0, 12)} layout="vertical" margin={{ left: -20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="drug_name" 
                      type="category" 
                      fontSize={10} 
                      fontWeight={900}
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', textTransform: 'uppercase' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--card-bg)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '16px',
                        padding: '12px'
                      }} 
                    />
                    <Bar dataKey="risk_score" radius={[0, 8, 8, 0]} barSize={16}>
                      {leaderboard.slice(0, 12).map((drug, index) => {
                        const score = drug.risk_score || 0;
                        const fill = score >= 75 ? '#EF4444' : score >= 55 ? '#F59E0B' : '#38BDF8';
                        return <Cell key={`cell-${index}`} fill={fill} fillOpacity={0.7} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
