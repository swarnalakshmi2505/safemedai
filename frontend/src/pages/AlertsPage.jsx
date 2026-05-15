import { useEffect, useState } from 'react'
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCcw, 
  Activity, 
  ChevronRight, 
  Terminal,
  ShieldCheck,
  Zap,
  Eye,
  Cpu,
  Send,
  AlertTriangle,
  Layers,
  BarChart3,
  Stethoscope,
  TrendingUp,
  FileText,
  Clock,
  User,
  ExternalLink
} from 'lucide-react'
import Layout from '../components/Layout'
import { alertsAPI, doctorAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const fetchData = async () => {
    try {
      const [alertsRes, reportsRes] = await Promise.all([
        alertsAPI.getAlerts(),
        doctorAPI.getAllReports()
      ])
      setAlerts(alertsRes.data)
      setReports(reportsRes.data)
    } catch (err) {
      console.error("Error fetching intelligence data:", err)
      toast.error("Failed to synchronize with clinical grid.")
    } finally {
      setLoading(false)
    }
  }

  const generateAlerts = async () => {
    setGenerating(true)
    const toastId = toast.loading("Scanning clinical clusters for risk anomalies...")
    try {
      const res = await alertsAPI.generateAlerts()
      toast.success(`${res.data.alerts_created} new risk signals detected.`, { id: toastId })
      await fetchData()
    } catch (err) {
      console.error("Error generating alerts:", err)
      toast.error("Scanning node failure.", { id: toastId })
    } finally {
      setGenerating(false)
    }
  }

  const validateAlert = async (id) => {
    try {
      await alertsAPI.validateAlert(id)
      toast.success("Signal validated.")
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_reviewed: true } : a))
    } catch (err) {
      toast.error("Validation failed.")
    }
  }

  const publishAlert = async (id) => {
    try {
      await alertsAPI.sendAlert(id)
      toast.success("Alert published to Doctor Dashboard.")
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_sent: true } : a))
    } catch (err) {
      toast.error("Publish failed.")
    }
  }

  const monitorAlert = async (id) => {
    try {
      await alertsAPI.monitorAlert(id)
      toast.success("Alert marked for active monitoring.")
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_monitored: true } : a))
    } catch (err) {
      toast.error("Monitor failed.")
    }
  }

  const reviewReport = async (id) => {
    try {
      await doctorAPI.reviewReport(id)
      toast.success("Clinical report verified and published to Doctor Intelligence Hub.")
      await fetchData() // Sync new alert created in backend
    } catch (err) {
      toast.error("Review failed.")
    }
  }

  useEffect(() => { fetchData() }, [])

  const mostDangerous = alerts.length > 0 ? [...alerts].sort((a, b) => b.risk_score - a.risk_score)[0] : null;

  if (loading) {
    return (
      <Layout title="Clinical Intelligence">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-brand-blue/10 border-t-brand-blue rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Synchronizing Intelligence Nodes...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Signal & Report Command">
      <div className="max-w-[1600px] mx-auto space-y-10 pb-20 animate-safemed-fadein px-4">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-black/5 dark:border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-brand-red/10 border border-brand-red/20 rounded-[2rem] flex items-center justify-center shadow-glow-red/10">
              <ShieldAlert className="w-10 h-10 text-brand-red" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                Intelligence <span className="text-brand-red">Command</span> Center
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-blue" />
                Dual-Stream Monitoring Active
              </p>
            </div>
          </div>
          <button
            onClick={generateAlerts}
            disabled={generating}
            className="btn-premium px-10 py-5 flex items-center gap-3 disabled:opacity-50 group"
          >
            {generating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            <span className="uppercase tracking-widest text-[11px] font-black">
              {generating ? 'Scanning Clinical Clusters...' : 'Initialize Grid Scan'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* COLUMN 1: ALERTS */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-brand-red" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Priority Safety Alerts</h2>
              </div>
              <span className="text-[10px] font-black text-brand-red bg-brand-red/10 px-3 py-1 rounded-full uppercase tracking-widest border border-brand-red/20">
                AI Generated Signals
              </span>
            </div>

            {/* Most Dangerous Drug Highlight */}
            {mostDangerous && (
              <div className="clinical-card border-l-[12px] border-brand-red bg-brand-red/[0.03] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-3 py-1 bg-brand-red text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-bl-xl rounded-tr-xl">High Hazard Node</span>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-brand-red text-white flex items-center justify-center shadow-glow-red/20 animate-pulse-slow">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{mostDangerous.drug_name}</h3>
                      <div className="flex items-center gap-1 text-brand-red">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-lg font-black">{mostDangerous.risk_score}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-bold italic mb-6">"{mostDangerous.message}"</p>
                    
                    {/* Risk Meter */}
                    <div className="mb-8 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Signal Toxicity Index</span>
                        <span className="text-[10px] font-black text-brand-red">{mostDangerous.risk_score}% Potential Hazard</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-red shadow-glow-red/20 transition-all duration-1000" 
                          style={{ width: `${mostDangerous.risk_score}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {!mostDangerous.is_sent && (
                        <button 
                          onClick={() => publishAlert(mostDangerous.id)}
                          className="px-6 py-3 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-red/90 transition-all flex items-center gap-2 shadow-glow-red/10"
                        >
                          <Send className="w-4 h-4" />
                          Publish Alert
                        </button>
                      )}
                      {!mostDangerous.is_monitored && (
                        <button 
                          onClick={() => monitorAlert(mostDangerous.id)}
                          className="px-6 py-3 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2"
                        >
                          <Activity className="w-4 h-4" />
                          Monitor Alert
                        </button>
                      )}
                      {mostDangerous.is_sent && (
                        <span className="px-6 py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Published
                        </span>
                      )}
                      {mostDangerous.is_monitored && (
                        <span className="px-6 py-3 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Monitoring
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {alerts.filter(a => a.id !== mostDangerous?.id).slice(0, 10).map(alert => (
                <div key={alert.id} className="clinical-card group hover:border-brand-blue/30 transition-all p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      alert.level === 'critical' ? 'bg-brand-red/10 text-brand-red' : 
                      alert.level === 'high' ? 'bg-brand-amber/10 text-brand-amber' : 'bg-brand-blue/10 text-brand-blue'
                    }`}>
                      {alert.level === 'critical' ? <AlertTriangle className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{alert.drug_name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Risk Score: {alert.risk_score} · {alert.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!alert.is_sent && (
                      <button 
                        onClick={() => publishAlert(alert.id)}
                        className="p-2 hover:bg-brand-red/10 text-slate-400 hover:text-brand-red rounded-lg transition-colors"
                        title="Publish Alert"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    )}
                    {!alert.is_monitored && (
                      <button 
                        onClick={() => monitorAlert(alert.id)}
                        className="p-2 hover:bg-brand-blue/10 text-slate-400 hover:text-brand-blue rounded-lg transition-colors"
                        title="Monitor Alert"
                      >
                        <Activity className="w-5 h-5" />
                      </button>
                    )}
                    {alert.is_sent && <Send className="w-5 h-5 text-emerald-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: DOCTOR REPORTS */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-brand-blue" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Doctor Intelligence Reports</h2>
              </div>
              <span className="text-[10px] font-black text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full uppercase tracking-widest border border-brand-blue/20">
                Manual Submissions
              </span>
            </div>

            {reports.length > 0 ? (
              <div className="space-y-6">
                {reports.slice(0, 8).map(report => (
                  <div key={report.id} className="clinical-card p-6 group hover:border-brand-emerald/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1 block">{report.report_id}</span>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{report.drug_name}</h4>
                      </div>
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                        report.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-amber/10 text-brand-amber'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-slate-500">
                        <User className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Reported by: Dr. {report.doctor_name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-tight">{new Date(report.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold italic line-clamp-2 mb-6 border-l-2 border-black/5 dark:border-white/5 pl-4">
                      "{report.symptoms}"
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black px-2 py-1 rounded uppercase border ${
                          report.severity?.toLowerCase() === 'life-threatening' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-black/5'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                      {report.status !== 'reviewed' ? (
                        <button 
                          onClick={() => reviewReport(report.report_id)}
                          className="text-[10px] font-black text-brand-emerald uppercase tracking-widest flex items-center gap-1 hover:underline bg-brand-emerald/5 px-3 py-1.5 rounded-lg border border-brand-emerald/10 transition-all"
                        >
                          Verify & Publish to Dashboard <CheckCircle className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                          Verified <CheckCircle className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-dashed border-black/10 dark:border-white/10 rounded-[2rem] p-20 text-center">
                 <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                 <p className="text-slate-500 text-xs font-black uppercase tracking-widest">No doctor reports submitted in current cycle.</p>
              </div>
            )}
          </div>

        </div>

        {!loading && alerts.length === 0 && reports.length === 0 && (
          <div className="text-center py-40 bg-slate-50 dark:bg-white/[0.01] border border-dashed border-black/10 dark:border-white/10 rounded-[3rem]">
            <div className="w-24 h-24 mx-auto mb-8 bg-brand-blue/5 border border-brand-blue/10 rounded-full flex items-center justify-center relative">
              <Eye className="w-10 h-10 text-brand-blue opacity-30" />
              <div className="absolute inset-0 rounded-full border-2 border-brand-blue/10 border-t-brand-blue/40 animate-spin-slow" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Clinical Harmony Maintained</h3>
            <p className="text-slate-500 text-sm mt-3 max-w-md mx-auto font-bold italic">No active safety threats or anomalous signals detected across the surveillance grid.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
