import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Search, 
  Mail, 
  Calendar,
  ChevronRight,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { authAPI } from '../services/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function DoctorVerificationPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUnverified();
  }, []);

  const fetchUnverified = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getUnverifiedDoctors();
      setDoctors(res.data || []);
    } catch (error) {
      console.error("Fetch unverified doctors error:", error);
      toast.error("Failed to load unverified doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await authAPI.verifyDoctor(id);
      toast.success("Doctor verified successfully");
      setDoctors(doctors.filter(d => d.id !== id));
    } catch (error) {
      toast.error("Verification failed");
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Personnel Authentication">
      <div className="max-w-[1200px] mx-auto space-y-10 pb-20 animate-safemed-fadein">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-8">
           <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl flex items-center justify-center shadow-glow-blue/10">
                 <ShieldCheck className="w-8 h-8 text-brand-blue" />
              </div>
              <div>
                 <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                    Doctor <span className="text-brand-blue">Verification</span>
                 </h1>
                 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mt-2">
                    Credential audit & authorization node · PV-AUTH-01
                 </p>
              </div>
           </div>
           
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="SEARCH PERSONNEL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl pl-12 pr-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-brand-blue/40 transition-all w-72"
              />
           </div>
        </div>

        {/* Statistics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="clinical-card border-brand-blue/20 bg-brand-blue/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Awaiting Audit</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{doctors.length}</h3>
           </div>
           <div className="clinical-card">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Node Status</p>
              <h3 className="text-xl font-black text-emerald-500 uppercase">Secure</h3>
           </div>
           <div className="clinical-card">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Access Protocol</p>
              <h3 className="text-xl font-black text-brand-blue uppercase">Manual Audit</h3>
           </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="lg:col-span-2 py-20 flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Syncing Personnel Nodes...</p>
            </div>
          ) : filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc) => (
              <div key={doc.id} className="clinical-card group hover:border-brand-blue/30 transition-all stagger-1">
                 <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl font-black text-brand-blue border border-black/5 dark:border-white/10 group-hover:bg-brand-blue group-hover:text-white transition-all">
                       {doc.full_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{doc.full_name}</h4>
                          <span className="text-[8px] font-black bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded uppercase border border-amber-500/20">Awaiting</span>
                       </div>
                       
                       <div className="space-y-2 mt-4">
                          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                             <Mail className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-black uppercase tracking-widest truncate">{doc.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                             <Calendar className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Registered: {new Date(doc.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verification Required</span>
                    </div>
                    <button 
                      onClick={() => handleVerify(doc.id)}
                      className="btn-premium !px-6 !py-3 flex items-center gap-2 group-hover:scale-105 transition-transform"
                    >
                       <UserCheck className="w-4 h-4" />
                       <span>Authorize</span>
                    </button>
                 </div>
              </div>
            ))
          ) : (
            <div className="lg:col-span-2 clinical-card border-dashed border-2 flex flex-col items-center justify-center py-20 opacity-50">
               <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-slate-400" />
               </div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">All personnel nodes verified</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 flex items-start gap-6">
           <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
              <AlertCircle className="w-6 h-6" />
           </div>
           <div>
              <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Protocol Note</h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                 Verification allows doctors to submit adverse event reports to the SafeMedAI intelligence pool. Only authorize personnel after confirming their clinical credentials and institutional affiliation.
              </p>
           </div>
        </div>

      </div>
    </Layout>
  );
}
