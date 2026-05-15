import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  Database, 
  ShieldAlert,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDrugs = async () => {
      try {
        const res = await api.get('/drugs');
        setDrugs(res.data);
      } catch (err) {
        console.error("Failed to fetch drugs:", err);
        toast.error("Clinical node synchronization failure.");
      } finally {
        setLoading(false);
      }
    };
    fetchDrugs();
  }, []);

  const filteredDrugs = drugs.filter(d => 
    d.drug_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="Clinical Intelligence Archive">
      <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-safemed-fadein">
        
        {/* Intelligence Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-black/5 dark:border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-brand-blue/10 border border-brand-blue/20 rounded-[2rem] flex items-center justify-center shadow-glow-blue/10">
              <FileText className="w-10 h-10 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                Report <span className="text-brand-blue">Generation</span> Matrix
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-cyan" />
                Select Clinical Compound for Deep-Dive Analysis
              </p>
            </div>
          </div>
          
          <div className="relative group min-w-[320px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by Compound Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-14 py-5 text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-blue/50 transition-all uppercase tracking-widest"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Synchronizing Intelligence Nodes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrugs.map((drug) => (
              <div 
                key={drug.drug_name}
                onClick={() => navigate(`/officer/report/${drug.drug_name}`)}
                className="clinical-card group cursor-pointer hover:border-brand-blue/40 hover:shadow-glow-blue/5 transition-all relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                   <ShieldAlert className="w-24 h-24 text-brand-blue" />
                </div>

                <div className="flex justify-between items-start mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                   <div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Compound Profile</span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize group-hover:text-brand-blue transition-colors">{drug.drug_name}</h3>
                   </div>
                   <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      drug.risk_score > 70 ? 'bg-brand-red/10 border-brand-red/20 text-brand-red' : 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                   }`}>
                      Score: {drug.risk_score}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="space-y-1">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Signals</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">{drug.total_reports?.toLocaleString()}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Signal Nodes</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-300">{(drug.top_reactions || []).length} ADR Clusters</p>
                   </div>
                </div>

                <button className="w-full btn-premium !py-4 flex items-center justify-center gap-3 group/btn">
                   <FileText className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">View Clinical Report</span>
                   <ArrowRight className="w-4 h-4 translate-x-0 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDrugs.length === 0 && (
          <div className="text-center py-40 bg-slate-50 dark:bg-white/[0.01] border border-dashed border-black/10 dark:border-white/10 rounded-[3rem]">
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">No matching compound signatures identified.</p>
          </div>
        )}

        {/* Global Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-black/5 dark:border-white/5">
           <div className="flex items-center gap-4 text-slate-400">
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{drugs.length} Total Monitored Compounds</span>
           </div>
           <div className="flex items-center gap-4 text-slate-400">
              <Clock className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Last Node Sync: Just Now</span>
           </div>
           <div className="flex items-center gap-4 text-slate-400">
              <ExternalLink className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Compliance Status: Validated</span>
           </div>
        </div>

      </div>
    </Layout>
  );
}
