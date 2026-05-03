import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Layout from '../components/Layout';
import KpiCard from '../components/KpiCard';
import { alertsAPI, analyticsAPI, dataAPI } from '../services/api';

const levelStyles = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  low: 'bg-green-500/20 text-green-400 border-green-500/40',
};

function getLevel(score) {
  if (score >= 70) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

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
        if (lb.status === 'fulfilled') setLeaderboard(lb.value.data || []);
        if (sum.status === 'fulfilled') setSummary(sum.value.data || {});
        if (al.status === 'fulfilled') setAlerts((al.value.data || []).slice(0, 5));
        if (tr.status === 'fulfilled') setTrends(tr.value.data || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAll();

    return () => {
      mounted = false;
    };
  }, []);

  const criticalCount = useMemo(() => leaderboard.filter((drug) => (drug.risk_score || 0) >= 70).length, [leaderboard]);
  const highCount = useMemo(() => leaderboard.filter((drug) => (drug.risk_score || 0) >= 55).length, [leaderboard]);
  const validatedAlerts = alerts.filter((alert) => alert.is_validated).length;
  const pendingAlerts = alerts.filter((alert) => !alert.is_validated).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center pl-56">
          <div className="text-lg text-sky-400 animate-pulse">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-[1500px] space-y-8 px-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Real-time pharmacovigilance monitoring</p>
        </div>

        {summary.total_reports === 0 && (
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-2xl p-5
                          flex items-center justify-between">
            <div>
              <p className="text-amber-300 font-medium">No data loaded yet</p>
              <p className="text-amber-400/70 text-sm mt-0.5">
                Run data ingestion to fetch live FDA FAERS data
              </p>
            </div>
            <button
              onClick={async () => {
                await dataAPI.triggerIngest(50)
                // Poll until done
                const poll = setInterval(async () => {
                  const s = await dataAPI.getIngestStatus()
                  if (!s.data.running) {
                    clearInterval(poll)
                    // Reload dashboard
                    const [lb, sum, al] = await Promise.allSettled([
                      analyticsAPI.getLeaderboard(),
                      dataAPI.getSummary(),
                      alertsAPI.getAlerts(),
                    ])
                    if (lb.status  === 'fulfilled') setLeaderboard(lb.value.data || [])
                    if (sum.status === 'fulfilled') setSummary(sum.value.data || {})
                    if (al.status  === 'fulfilled') setAlerts((al.value.data || []).slice(0,5))
                  }
                }, 3000)
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5
                         rounded-xl text-sm font-medium transition-colors flex-shrink-0"
            >
              Run Ingestion Now
            </button>
          </div>
        )}

        <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            title="Total Reports"
            value={summary.total_reports?.toLocaleString?.() || summary.total_reports || 0}
            sub="From FDA FAERS"
            color="sky"
            icon="📊"
          />
          <KpiCard
            title="Drugs Tracked"
            value={summary.drugs_tracked || 0}
            sub="Active monitoring"
            color="green"
            icon="💊"
          />
          <KpiCard
            title="Active Alerts"
            value={pendingAlerts}
            sub={`${validatedAlerts} validated`}
            color="yellow"
            icon="⚠️"
          />
          <KpiCard
            title="Critical Drugs"
            value={criticalCount}
            sub={`High risk: ${highCount}`}
            color="red"
            icon="🚨"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Warfarin - Yearly Report Trend</h2>
                <p className="text-xs text-slate-500">Reports versus serious events over time</p>
              </div>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="report_count" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} name="Reports" />
                  <Line type="monotone" dataKey="serious_count" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} name="Serious" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">Top Drugs by Risk Score</h2>
              <p className="text-xs text-slate-500">Combined risk ranking from current tracked drugs</p>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={leaderboard.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <YAxis dataKey="drug_name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="risk_score" radius={[0, 4, 4, 0]} name="Risk Score">
                    {leaderboard.slice(0, 8).map((drug) => {
                      const level = getLevel(drug.risk_score || 0);
                      const fill = level === 'critical' ? '#ef4444' : level === 'high' ? '#f97316' : level === 'medium' ? '#eab308' : '#22c55e';
                      return <Cell key={drug.drug_name} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Risk Leaderboard</h2>
                <p className="text-xs text-slate-500">Top 5 drugs ranked by live risk score</p>
              </div>
              <button onClick={() => navigate('/officer/leaderboard')} className="text-xs text-sky-400 hover:underline">
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((drug, index) => {
                const level = getLevel(drug.risk_score || 0);
                return (
                  <button
                    key={drug.drug_name}
                    onClick={() => navigate(`/officer/drug/${encodeURIComponent(drug.drug_name)}`)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-left transition hover:border-slate-600 hover:bg-slate-800/60"
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? 'bg-red-500 text-white' : index === 1 ? 'bg-orange-500 text-white' : index === 2 ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                      {index + 1}
                    </span>
                    <span className="flex-1 capitalize text-white">{drug.drug_name}</span>
                    <span className="text-xs text-slate-400">{drug.total_reports} reports</span>
                    <span className={`rounded-full border px-3 py-1 text-sm font-bold ${levelStyles[level]}`}>{(drug.risk_score || 0).toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Live Alerts</h2>
                <p className="text-xs text-slate-500">Latest officer review queue</p>
              </div>
              <button onClick={() => navigate('/officer/alerts')} className="text-xs text-sky-400 hover:underline">
                Manage →
              </button>
            </div>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">No alerts yet. Generate them from Alerts.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="capitalize text-sm font-medium text-white">{alert.drug_name}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${levelStyles[alert.level] || levelStyles.medium}`}>{alert.level}</span>
                    </div>
                    <p className="text-xs leading-5 text-slate-400">{alert.message}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{new Date(alert.created_at).toLocaleString()}</span>
                      <span>{alert.is_sent ? 'Sent' : alert.is_validated ? 'Validated' : 'Pending'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
