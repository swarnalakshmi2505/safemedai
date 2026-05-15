import { useState, useEffect } from 'react';
import { User, Shield, Key, Mail, Building, Clock, CheckCircle, ShieldCheck, ExternalLink, Settings } from 'lucide-react';
import Layout from '../components/Layout';
import { authAPI } from '../services/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getMe().then(res => {
      setUser(res.data);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load profile node:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Layout title="Clinical Profile">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Personnel Intelligence Profile">
      <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-safemed-fadein">
        
        {/* Profile Header */}
        <div className="clinical-card border-l-4 border-brand-cyan relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <User className="w-64 h-64 text-brand-cyan" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 bg-brand-cyan/10 border-2 border-brand-cyan/30 rounded-3xl flex items-center justify-center shadow-glow-cyan/10 group-hover:scale-105 transition-transform duration-500">
                <User className="w-16 h-16 text-brand-cyan" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-brand-emerald p-2 rounded-xl shadow-lg border border-[#0B1220]">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold text-white tracking-tight leading-none uppercase">
                  {user?.full_name || 'Protocol Officer'}
                </h1>
                <span className="px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-[10px] font-black text-brand-blue uppercase tracking-widest self-center">
                  Verified {user?.role || 'Officer'} Node
                </span>
              </div>
              <p className="text-surface-500 font-mono text-sm tracking-widest uppercase">
                NODE ID: PV-{user?.id?.toString().slice(-8) || 'SYSTEM-REDACTED'}
              </p>
            </div>

            <button className="btn-premium px-8 py-4 flex items-center gap-3">
              <Settings className="w-4 h-4" />
              <span className="uppercase tracking-widest text-xs font-bold">Configure Protocol</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Identity Matrix */}
          <div className="lg:col-span-2 space-y-10">
            <div className="clinical-card">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <Shield className="w-5 h-5 text-brand-blue" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Identity Matrix</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { icon: Mail, label: 'Communication Node', value: user?.email || 'N/A' },
                  { icon: Building, label: 'Authorized Institution', value: user?.institution || 'Global Health Surveillance' },
                  { icon: Shield, label: 'System Privileges', value: user?.role === 'officer' ? 'Full Audit Authority' : 'Clinical Data Submission' },
                  { icon: Clock, label: 'Node Initialization', value: new Date(user?.created_at).toLocaleDateString() || 'N/A' },
                ].map(item => (
                  <div key={item.label} className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-brand-blue">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-white font-bold text-lg">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="clinical-card">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <Key className="w-5 h-5 text-brand-amber" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Security Protocols</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm uppercase tracking-tight">Two-Factor Authentication</p>
                      <p className="text-surface-600 text-[10px] font-bold uppercase">Node Authorization: ACTIVE</p>
                    </div>
                  </div>
                  <button className="text-brand-blue text-[10px] font-black uppercase tracking-widest hover:underline">Revoke Access</button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm uppercase tracking-tight">Encryption Keys</p>
                      <p className="text-surface-600 text-[10px] font-bold uppercase">RSA-4096 · Updated 3 days ago</p>
                    </div>
                  </div>
                  <button className="text-brand-blue text-[10px] font-black uppercase tracking-widest hover:underline">Rotate Keys</button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-10">
            <div className="clinical-card">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                <Activity className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Activity Ledger</h3>
              </div>
              <div className="space-y-6">
                {[
                  { event: 'Signal Audit Protocol', time: '2 hours ago', status: 'COMPLETE' },
                  { event: 'Database Node Sync', time: '5 hours ago', status: 'SYNCED' },
                  { event: 'Auth Token Rotation', time: 'Yesterday', status: 'SECURE' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== 2 && <div className="absolute left-2.5 top-6 w-0.5 h-10 bg-white/5" />}
                    <div className="w-5 h-5 rounded-full bg-brand-blue/20 border border-brand-blue/40 mt-1" />
                    <div>
                      <p className="text-white text-xs font-bold uppercase tracking-tight">{act.event}</p>
                      <p className="text-surface-600 text-[10px] font-bold uppercase mt-1">{act.time} · <span className="text-brand-cyan">{act.status}</span></p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-10 py-4 border border-white/10 rounded-xl text-surface-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                Full System Log <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Activity({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
  )
}
