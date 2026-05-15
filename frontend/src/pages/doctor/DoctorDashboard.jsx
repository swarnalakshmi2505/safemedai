import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileText,
  Activity,
  ArrowRight,
  Stethoscope,
  FlaskConical,
  Bell,
  X,
  Info,
  BrainCircuit,
  CheckCircle,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, alertsAPI, dataAPI } from '../../services/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

export default function DoctorDashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (typeof refreshUser === 'function') {
      refreshUser();
    }
  }, []);
  const [stats, setStats] = useState({
    mySubmissions: 0,
    pendingReview: 0,
    activeAlerts: 0,
    drugsMonitored: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [peerInsights, setPeerInsights] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Use individual try-catches or selective Promise.all to prevent one failure from breaking everything
        const results = await Promise.allSettled([
          doctorAPI.getMyReports(),
          alertsAPI.getAlerts(),
          dataAPI.getSummary(),
          dataAPI.getLeaderboard(),
          doctorAPI.getAllReports('reviewed')
        ]);

        const reportsRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
        const alertsRes = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
        const summaryRes = results[2].status === 'fulfilled' ? results[2].value : { data: {} };
        const leaderboardRes = results[3].status === 'fulfilled' ? results[3].value : { data: [] };
        const peerRes = results[4].status === 'fulfilled' ? results[4].value : { data: [] };

        if (results[0].status === 'rejected') console.error("Reports API failed:", results[0].reason);
        if (results[1].status === 'rejected') console.error("Alerts API failed:", results[1].reason);
        if (results[2].status === 'rejected') console.error("Summary API failed:", results[2].reason);
        if (results[3].status === 'rejected') console.error("Leaderboard API failed:", results[3].reason);
        if (results[4].status === 'rejected') console.error("Peer Reports API failed:", results[4].reason);

        const reports = reportsRes.data || [];
        const allAlerts = alertsRes.data || [];
        const sentAlerts = allAlerts.filter(a => a.is_sent || a.is_monitored).slice(0, 5);
        
        setStats({
          mySubmissions: reports.length,
          pendingReview: reports.filter(r => r.status === 'pending').length,
          activeAlerts: allAlerts.filter(a => a.is_sent || a.is_monitored).length,
          drugsMonitored: summaryRes.data?.drugs_tracked || 0
        });

        setRecentAlerts(sentAlerts);
        setRecentSubmissions(reports.slice(0, 5));
        setPeerInsights((peerRes.data || []).slice(0, 5));
        setLeaderboard(leaderboardRes.data || []);
      } catch (error) {
        console.error("Dashboard critical fetch error:", error);
        toast.error("Cluster synchronization latency detected");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getSeverityBadge = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'life-threatening' || s === 'critical') 
      return <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-black uppercase tracking-widest">Critical</span>;
    if (s === 'severe' || s === 'high') 
      return <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest">High Risk</span>;
    if (s === 'moderate') 
      return <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/20 text-[9px] font-black uppercase tracking-widest">Moderate</span>;
    return <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[9px] font-black uppercase tracking-widest">Observation</span>;
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'reviewed') return <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Reviewed</span>;
    if (s === 'pending') return <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">In Review</span>;
    return <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-500/10 px-2 py-0.5 rounded border border-slate-500/20">{status}</span>;
  };

  const openReport = async (reportId) => {
    try {
      const res = await doctorAPI.getReport(reportId);
      setSelectedReport(res.data);
      setShowReportModal(true);
    } catch (error) {
      toast.error("Clinical node retrieval failure");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'reviewed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'actioned': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'life-threatening': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'severe': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'mild': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <Layout title="Clinical Console">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-teal-500/10 border-t-teal-500 rounded-full animate-spin shadow-glow-teal/20"></div>
              <Stethoscope className="w-8 h-8 text-teal-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Initializing Portal Data</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Doctor Intelligence Portal">
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-safemed-fadein px-4 sm:px-6">
        
        {/* Unverified Account Warning */}
        {user?.role === 'doctor' && !user?.is_verified && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex items-center gap-6 animate-pulse">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-amber-500 uppercase tracking-tighter">Account Pending Verification</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1">
                Your clinical profile is awaiting authorization from the Pharmacovigilance Command Center. You can draft reports, but they will not be submitted to the global intelligence pool until your identity node is verified.
              </p>
            </div>
            <div className="hidden sm:block">
               <span className="text-[9px] font-black bg-amber-500 text-white px-3 py-1 rounded-full uppercase tracking-widest">Protocol-44 Locked</span>
            </div>
          </div>
        )}

        {/* Professional Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-8">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center shadow-glow-teal/10">
                 <ShieldCheck className="w-8 h-8 text-teal-500" />
              </div>
              <div>
                 <div className="flex items-center gap-3">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                       Clinical <span className="text-teal-500">Intelligence</span>
                    </h1>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${user?.is_verified ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'} text-[9px] font-black uppercase tracking-[0.2em]`}>
                       {user?.is_verified ? 'Verified Doctor' : 'Unverified Account'}
                    </span>
                 </div>
                 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mt-2">
                    Welcome, Dr. {user?.full_name?.split(' ').pop()} · Pharmacovigilance Node 04-BETA
                 </p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/doctor/submit')}
                className="btn-premium !bg-teal-600 hover:!bg-teal-500 !px-8 flex items-center gap-2 shadow-glow-teal/20"
              >
                 <FilePlus className="w-4 h-4" />
                 <span>Submit Intelligence</span>
              </button>
           </div>
        </div>

        {/* Clinical KPIs - Teal Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
           {[
             { label: 'My Submissions', value: stats.mySubmissions, icon: <FileText className="w-5 h-5" />, color: 'teal', trend: '+2 this week' },
             { label: 'Pending Review', value: stats.pendingReview, icon: <Clock className="w-5 h-5" />, color: 'amber', trend: 'Awaiting Action' },
             { label: 'Active Drug Alerts', value: stats.activeAlerts, icon: <Bell className="w-5 h-5" />, color: 'red', trend: 'Priority Signals' },
             { label: 'Drugs Monitored', value: stats.drugsMonitored, icon: <FlaskConical className="w-5 h-5" />, color: 'emerald', trend: 'Global Database' },
           ].map((kpi) => (
             <div key={kpi.label} className="clinical-card group hover:border-teal-500/30 transition-all p-6 relative overflow-hidden">
                <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                   {kpi.icon}
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                <div className="flex items-end justify-between">
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{kpi.value}</h3>
                   <span className={`text-[9px] font-black uppercase tracking-tighter ${
                     kpi.color === 'red' ? 'text-red-500' : 
                     kpi.color === 'amber' ? 'text-amber-500' : 
                     'text-teal-500'
                   }`}>
                      {kpi.trend}
                   </span>
                </div>
                <div className={`h-1 w-full mt-4 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden`}>
                   <div className={`h-full transition-all duration-1000 ${
                     kpi.color === 'red' ? 'bg-red-500' : 
                     kpi.color === 'amber' ? 'bg-amber-500' : 
                     'bg-teal-500'
                   }`} style={{ width: '65%' }}></div>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Active Drug Alerts from Officers */}
          <div className="clinical-card !p-0 overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-red-500/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Drug Safety Alerts</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Verified signals from safety officers</p>
                </div>
              </div>
              <button className="text-[10px] font-black text-teal-500 uppercase tracking-widest hover:underline">View Stream</button>
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5 flex-1">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <div key={alert.id} className="p-6 hover:bg-teal-500/[0.02] transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded bg-teal-500/10 flex items-center justify-center text-[10px] font-black text-teal-500 uppercase">
                          {alert.drug_name.substring(0, 2)}
                        </span>
                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{alert.drug_name}</span>
                      </div>
                      {getSeverityBadge(alert.level)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-black italic mb-4 leading-relaxed line-clamp-2">
                      "{alert.message}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Issued: {new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center opacity-40">
                  <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No active priority signals</p>
                </div>
              )}
            </div>
            <button className="p-4 bg-slate-50 dark:bg-white/5 text-[10px] font-black text-center text-slate-500 uppercase tracking-widest hover:text-teal-500 transition-colors">
              Access Alert Archive
            </button>
          </div>

          {/* My Recent Submissions */}
          <div className="clinical-card !p-0 overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-teal-500/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">My Clinical Feed</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Status of your submitted reports</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/doctor/my-reports')}
                className="text-[10px] font-black text-teal-500 uppercase tracking-widest hover:underline"
              >
                Full Repository
              </button>
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5 flex-1">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-teal-500/[0.02] transition-colors group cursor-pointer"
                       onClick={() => openReport(report.report_id)}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest mb-1 block">{report.report_id}</span>
                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{report.drug_name}</span>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${
                        report.severity?.toLowerCase() === 'life-threatening' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {report.severity}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex-1"></div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <FilePlus className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">No clinical data submitted</p>
                  <button 
                    onClick={() => navigate('/doctor/submit')}
                    className="text-[10px] bg-teal-500 text-white font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-teal-600 transition-all shadow-glow-teal/20"
                  >
                    Initiate First Report
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/doctor/my-reports')}
              className="p-4 bg-slate-50 dark:bg-white/5 text-[10px] font-black text-center text-slate-500 uppercase tracking-widest hover:text-teal-500 transition-colors"
            >
              Export Clinical Data
            </button>
          </div>

          {/* Verified Peer Insights */}
          <div className="clinical-card !p-0 overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-emerald-500/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Verified Peer Insights</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Validated reports from clinical staff</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/doctor/my-reports')}
                className="text-[10px] font-black text-teal-500 uppercase tracking-widest hover:underline"
              >
                Global Feed
              </button>
            </div>
            <div className="divide-y divide-black/5 dark:divide-white/5 flex-1">
              {peerInsights.length > 0 ? (
                peerInsights.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-emerald-500/[0.02] transition-colors group cursor-pointer"
                       onClick={() => openReport(report.report_id)}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 block">Verified by Safety Officer</span>
                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{report.drug_name}</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Validated</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-black italic mb-4 leading-relaxed line-clamp-2">
                      "{report.symptoms}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Reported by Dr. {report.doctor_name?.split(' ').pop()}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(report.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center opacity-40">
                  <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No verified peer data available</p>
                </div>
              )}
            </div>
            <button className="p-4 bg-slate-50 dark:bg-white/5 text-[10px] font-black text-center text-slate-500 uppercase tracking-widest hover:text-emerald-500 transition-colors">
              Access Intelligence Matrix
            </button>
          </div>
        </div>

        {/* Global Risk Momentum Chart - Teal/Emerald */}
        <div className="clinical-card !p-8 sm:!p-10">
           <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-3 uppercase">
                  <Activity className="w-6 h-6 text-teal-500" />
                  Global Risk Momentum
                </h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Relative risk indices for prioritized compounds</p>
              </div>
              <div className="flex gap-2">
                 <span className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[10px] font-black text-teal-500 uppercase tracking-widest">
                    Live Stream: Active
                 </span>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaderboard.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="drug_name" 
                    stroke="#64748B" 
                    fontSize={10} 
                    fontWeight={900}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => val?.substring(0, 8).toUpperCase()}
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={10} 
                    fontWeight={900}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  />
                  <Bar 
                    dataKey="risk_score" 
                    radius={[6, 6, 0, 0]} 
                    barSize={32}
                    onClick={(data) => setSelectedDrug(data)}
                    style={{ cursor: 'pointer' }}
                  >
                    {leaderboard.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.risk_score >= 70 ? '#EF4444' : entry.risk_score >= 50 ? '#F59E0B' : '#14B8A6'} 
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { 
              title: 'Submit Report', 
              sub: 'Log Adverse Observation', 
              icon: <FilePlus className="w-8 h-8" />, 
              color: 'teal', 
              path: '/doctor/submit' 
            },
            { 
              title: 'Search Drugs', 
              sub: 'Clinical Data Access', 
              icon: <Search className="w-8 h-8" />, 
              color: 'emerald', 
              path: '/doctor/drugs' 
            },
            { 
              title: 'Ask AI Assistant', 
              sub: 'Clinical Support Node', 
              icon: <MessageSquare className="w-8 h-8" />, 
              color: 'purple', 
              path: '/doctor/chatbot' 
            },
          ].map((action) => (
            <button 
              key={action.title}
              onClick={() => navigate(action.path)}
              className="clinical-card group flex items-center gap-6 p-8 hover:border-teal-500/50 hover:bg-teal-500/[0.02] transition-all text-left"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-glow-${action.color}/10 ${
                action.color === 'teal' ? 'bg-teal-500/10 text-teal-500' :
                action.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                'bg-purple-500/10 text-purple-500'
              }`}>
                {action.icon}
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{action.title}</h4>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{action.sub}</p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                 <ArrowRight className="w-5 h-5 text-teal-500" />
              </div>
            </button>
          ))}
        </div>

      </div>
      
      {/* Intelligence Deep-Dive Modal */}
      {selectedDrug && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-safemed-fadein">
          <div className="clinical-card max-w-2xl w-full !p-0 overflow-hidden shadow-2xl border-teal-500/30">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-teal-500/5">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500">
                    <FlaskConical className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selectedDrug.drug_name} Intelligence</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Pharmacovigilance Deep-Dive</p>
                 </div>
              </div>
              <button onClick={() => setSelectedDrug(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                 <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Side Effects */}
              <div>
                 <div className="flex items-center gap-2 mb-4 text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Primary Adverse Reactions</h3>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {selectedDrug.top_reactions?.length > 0 ? selectedDrug.top_reactions.map(r => (
                      <span key={r} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[10px] font-black uppercase">{r}</span>
                    )) : (
                      <span className="text-xs text-slate-400 italic">No significant reactions recorded in current pool.</span>
                    )}
                 </div>
              </div>

              {/* Alternatives */}
              <div>
                 <div className="flex items-center gap-2 mb-4 text-teal-500">
                    <ShieldCheck className="w-4 h-4" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Clinical Alternatives (Safer Profiles)</h3>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedDrug.alternatives?.length > 0 ? selectedDrug.alternatives.map(alt => (
                      <div key={alt.drug_name} className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-xl flex items-center justify-between">
                         <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{alt.drug_name}</p>
                            <p className="text-[9px] text-teal-500 font-black uppercase">Risk Index: {alt.risk_score}</p>
                         </div>
                         <ChevronRight className="w-4 h-4 text-teal-500/50" />
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 italic">No alternative suggestions found for this compound.</p>
                    )}
                 </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 flex justify-end gap-3">
               <button onClick={() => setSelectedDrug(null)} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-colors">Dismiss</button>
               <button 
                 onClick={() => { navigate(`/doctor/drugs`); setSelectedDrug(null); }}
                 className="px-6 py-2.5 bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-teal-600 transition-all shadow-glow-teal/20"
               >
                 Full Safety Report
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal - High Fidelity Implementation */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-safemed-fadein">
          <div className="absolute inset-0" onClick={() => setShowReportModal(false)} />
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">Clinical Node Analysis</h2>
                    <span className="font-mono text-sm text-teal-400 font-bold px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded">
                      {selectedReport.report_id}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                    Node Sync: {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Patient Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-[10px] uppercase tracking-widest">
                    <User className="w-4 h-4" /> Patient Info
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 border border-slate-800/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 font-black">NODE ID:</span>
                      <span className="text-xs text-slate-300 font-mono">{selectedReport.patient_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 font-black">AGE/GEN:</span>
                      <span className="text-xs text-slate-300 uppercase">{selectedReport.patient_age}Y / {selectedReport.patient_gender}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[9px] text-slate-500 font-black uppercase block mb-1">Conditions</span>
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        {selectedReport.pre_existing_conditions || 'None reported'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Drug Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                    <Activity className="w-4 h-4" /> Administration
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 border border-slate-800/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 font-black">DRUG:</span>
                      <span className="text-xs text-emerald-400 font-black uppercase">{selectedReport.drug_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 font-black">DOSAGE:</span>
                      <span className="text-xs text-slate-300">{selectedReport.dosage || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 font-black">ONSET:</span>
                      <span className="text-xs text-slate-300">{selectedReport.onset_date || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Status Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-[10px] uppercase tracking-widest">
                    <AlertTriangle className="w-4 h-4" /> Status Matrix
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4 border border-slate-800/50 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 font-black">STATUS:</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 font-black">SEVERITY:</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${getSeverityColor(selectedReport.severity)}`}>
                        {selectedReport.severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Sections */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-white mb-3 flex items-center gap-2 uppercase tracking-widest">
                    <div className="w-1 h-4 bg-teal-500 rounded-full" />
                    Clinical Observation
                  </h4>
                  <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-800">
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedReport.symptoms}
                    </p>
                  </div>
                </div>

                {/* AI Analysis Block */}
                <div>
                  <h4 className="text-[10px] font-black text-white mb-3 flex items-center gap-2 uppercase tracking-widest">
                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                    Neural Signal Validation
                  </h4>
                  <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6">
                    {selectedReport.ai_analysis ? (
                      <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                        {selectedReport.ai_analysis}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-6">
                        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-3" />
                        <p className="text-[9px] text-purple-400 font-black uppercase tracking-widest">Processing Intelligence Feed...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-white mb-3 flex items-center gap-2 uppercase tracking-widest">
                    <div className="w-1 h-4 bg-blue-500 rounded-full" />
                    Medical Protocol
                  </h4>
                  <div className="bg-blue-500/10 rounded-2xl p-5 border border-blue-500/20">
                    <p className="text-xs text-blue-300 font-black flex items-center gap-3 italic uppercase tracking-tight">
                      <CheckCircle className="w-4 h-4" />
                      {selectedReport.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 flex justify-end bg-black/20">
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Terminate View
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
