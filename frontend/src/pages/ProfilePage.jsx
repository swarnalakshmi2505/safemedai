import { useState, useEffect } from 'react';
import { 
  User, Shield, Key, Mail, Building, Clock, 
  CheckCircle, ShieldCheck, ExternalLink, Settings, 
  Edit2, Check, X, Download, FileText, ChevronRight,
  Activity as ActivityIcon, Sun, Moon, AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { authAPI, downloadsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    loadData();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} Mode Activated`);
  };

  const loadData = async () => {
    try {
      const [userRes, historyRes] = await Promise.all([
        authAPI.getMe(),
        downloadsAPI.getHistory()
      ]);
      setUser(userRes.data);
      setNewName(userRes.data.full_name);
      setHistory(historyRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load profile node:", err);
      toast.error("Cluster synchronization failure");
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await authAPI.updateProfile(newName);
      setUser({ ...user, full_name: newName });
      setIsEditing(false);
      toast.success("Identity Matrix Updated");
    } catch (err) {
      toast.error("Protocol update failure");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Clinical Profile">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin shadow-glow-blue/10"></div>
             <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest animate-pulse">Syncing Personnel Data</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Personnel Intelligence Profile">
      <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-safemed-fadein">
        
        {/* Profile Header */}
        <div className="clinical-card border-l-4 border-brand-cyan relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
            <User className="w-64 h-64 text-brand-cyan" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative">
              <div className="w-32 h-32 bg-brand-cyan/10 border-2 border-brand-cyan/30 rounded-3xl flex items-center justify-center shadow-glow-cyan/10 group-hover:scale-105 transition-transform duration-500">
                <User className="w-16 h-16 text-brand-cyan" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-brand-emerald p-2 rounded-xl shadow-lg border-2 border-white dark:border-brand-navy">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                    <input 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-transparent border-none text-2xl font-black text-slate-900 dark:text-white px-3 focus:outline-none w-64"
                      autoFocus
                    />
                    <button 
                      onClick={handleUpdateName}
                      disabled={saving}
                      className="p-2 bg-brand-emerald/20 text-brand-emerald rounded-lg hover:bg-brand-emerald/30 disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => { setIsEditing(false); setNewName(user.full_name); }}
                      className="p-2 bg-brand-red/20 text-brand-red rounded-lg hover:bg-brand-red/30"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                      {user?.full_name || 'Protocol Officer'}
                    </h1>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-brand-blue hover:border-brand-blue/30 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${user?.is_verified ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                  {user?.is_verified ? 'Verified' : 'Awaiting Verification'} {user?.role || 'Officer'} Node
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase mt-2">
                Clinical Node ID: STRAT-PV-{user?.id?.toString().padStart(6, '0') || 'SYSTEM'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:border-brand-blue/30 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="btn-premium flex items-center gap-3">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Identity Matrix */}
          <div className="lg:col-span-2 space-y-10">
            <div className="clinical-card">
              <div className="flex items-center justify-between mb-8 border-b border-black/5 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                   <Shield className="w-5 h-5 text-brand-blue" />
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Identity Matrix</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { icon: Mail, label: 'Communication Node', value: user?.email || 'N/A' },
                  { icon: Building, label: 'Authorized Institution', value: user?.institution || 'SafeMedAI Clinical Hub' },
                  { icon: Shield, label: 'System Privileges', value: user?.role === 'officer' ? 'Full Audit Authority' : 'Clinical Data Submission' },
                  { icon: Clock, label: 'Node Initialization', value: new Date(user?.created_at).toLocaleDateString() || 'N/A' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] p-6 rounded-2xl group hover:border-brand-blue/30 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2 bg-brand-blue/10 border border-brand-blue/20 rounded-lg text-brand-blue">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-slate-900 dark:text-white font-black text-lg">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Download History */}
            <div className="clinical-card">
              <div className="flex items-center justify-between mb-8 border-b border-black/5 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                   <Download className="w-5 h-5 text-brand-cyan" />
                   <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Clinical Artifact History</h3>
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{history.length} Artifacts</span>
              </div>
              
              <div className="space-y-4">
                {history.length > 0 ? history.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/[0.05] rounded-2xl hover:border-brand-blue/20 transition-all group">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors">
                          <FileText className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-tight">{item.drug_name} Analysis Report</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase mt-1">
                            {new Date(item.downloaded_at).toLocaleString()} · {item.report_type}
                          </p>
                       </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-brand-blue transition-colors">
                       <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-slate-50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-black/5 dark:border-white/5">
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No Intelligence Artifacts Generated</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-10">
            {user?.role === 'doctor' && (
              <div className={`clinical-card ${user?.is_verified ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                <div className="flex items-center gap-3 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                  <ShieldCheck className={`w-5 h-5 ${user?.is_verified ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Clinical Status</h3>
                </div>
                
                {user?.is_verified ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Verified Personnel</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-1">License Node</p>
                      <p className="text-sm font-black text-white font-mono">{user?.license_number || 'OFFICIAL'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Verification Pending</span>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Medical License Number</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          defaultValue={user?.license_number}
                          id="licenseInput"
                          placeholder="LIC-XXXXXX"
                          className="flex-1 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-brand-blue/30"
                        />
                        <button 
                          onClick={async () => {
                            const val = document.getElementById('licenseInput').value;
                            if (!val) return toast.error("License required");
                              try {
                                const res = await authAPI.requestVerification(val);
                                setUser(res.data);
                                if (typeof updateUser === 'function') {
                                  updateUser(res.data);
                                }
                                toast.success("Verification Protocol Verified");
                              } catch (e) {
                                toast.error(e.response?.data?.detail || "Protocol error");
                              }
                          }}
                          className="p-2 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 transition-all"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-500 font-black leading-relaxed mt-2 uppercase tracking-widest">
                        Protocol: Re-enter your registration License ID to authorize this clinical node.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="clinical-card">
              <div className="flex items-center gap-3 mb-8 border-b border-black/5 dark:border-white/5 pb-4">
                <ActivityIcon className="w-5 h-5 text-brand-emerald" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Security Ledger</h3>
              </div>
              <div className="space-y-6">
                {[
                  { event: 'Identity Matrix Update', time: 'Just now', status: 'COMPLETE' },
                  { event: 'Signal Audit Protocol', time: '2 hours ago', status: 'COMPLETE' },
                  { event: 'Database Node Sync', time: '5 hours ago', status: 'SYNCED' },
                  { event: 'Auth Token Rotation', time: 'Yesterday', status: 'SECURE' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== 3 && <div className="absolute left-2.5 top-6 w-0.5 h-10 bg-black/5 dark:bg-white/5" />}
                    <div className={`w-5 h-5 rounded-full border mt-1 ${i === 0 ? 'bg-brand-emerald/20 border-brand-emerald/40' : 'bg-brand-blue/20 border-brand-blue/40'}`} />
                    <div>
                      <p className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-tight">{act.event}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase mt-1">{act.time} · <span className="text-brand-cyan">{act.status}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="clinical-card bg-brand-blue/5 border-brand-blue/20">
               <h4 className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] mb-4">Protocol Support</h4>
               <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed font-black mb-6 italic">Need higher clearance or node reconfiguration? Contact the SafeMedAI Command Center.</p>
               <button className="w-full py-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-blue/20 transition-all">
                  Request Authorization
               </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
