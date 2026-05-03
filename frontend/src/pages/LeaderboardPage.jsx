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
} from 'recharts';

import Layout from '../components/Layout';
import { analyticsAPI, dataAPI } from '../services/api';

function getLevel(score) {
  if (score >= 70) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

const levelStyles = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  low: 'bg-green-500/20 text-green-400 border-green-500/40',
};

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [summary, setSummary] = useState({});
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([analyticsAPI.getLeaderboard(), dataAPI.getSummary(), dataAPI.getTrends('warfarin')])
      .then(([leaderboardResponse, summaryResponse, trendsResponse]) => {
        if (!mounted) return;
        setLeaderboard(leaderboardResponse.data || []);
        setSummary(summaryResponse.data || {});
        setTrends(trendsResponse.data || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const criticalCount = useMemo(() => leaderboard.filter((drug) => (drug.risk_score || 0) >= 70).length, [leaderboard]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center pl-56">
          <div className="text-lg text-sky-400 animate-pulse">Loading leaderboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-[1500px] space-y-8 px-8 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Risk Leaderboard</h1>
            <p className="mt-1 text-sm text-slate-400">Top drugs ranked by current ROR-based risk score</p>
          </div>
          <button
            onClick={() => navigate('/officer/alerts')}
            className="rounded-xl border border-sky-500/40 bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
          >
            Review alerts
          </button>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total Reports</p>
            <p className="mt-2 text-3xl font-bold text-white">{summary.total_reports?.toLocaleString?.() || summary.total_reports || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Drugs Tracked</p>
            <p className="mt-2 text-3xl font-bold text-white">{summary.drugs_tracked || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Critical Drugs</p>
            <p className="mt-2 text-3xl font-bold text-white">{criticalCount}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30 xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Top Drugs by Risk Score</h2>
                <p className="text-xs text-slate-500">Vertical ranking from the live dataset</p>
              </div>
            </div>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={leaderboard.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <YAxis dataKey="drug_name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={110} />
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

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <h2 className="text-base font-semibold text-white">Recent Fatal Signals</h2>
            <p className="mt-1 text-xs text-slate-500">Current trend summary for the selected drug focus</p>
            <div className="mt-5 space-y-4">
              {trends.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">No trend data available.</p>
              ) : (
                trends.slice(-3).map((trend) => (
                  <div key={trend.year} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{trend.year}</span>
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-300">{trend.report_count} reports</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Serious events: {trend.serious_count}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Drug Rankings</h2>
              <p className="text-xs text-slate-500">Top results from the live analytics leaderboard</p>
            </div>
          </div>
          <div className="space-y-3">
            {leaderboard.map((drug, index) => {
              const level = getLevel(drug.risk_score || 0);
              return (
                <button
                  key={drug.drug_name}
                  onClick={() => navigate(`/officer/drug/${encodeURIComponent(drug.drug_name)}`)}
                  className="flex w-full items-center gap-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-left transition hover:border-slate-600 hover:bg-slate-800/60"
                >
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-black ${index === 0 ? 'bg-red-500/20 text-red-400' : index === 1 ? 'bg-orange-500/20 text-orange-400' : index === 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                    #{drug.rank}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <h3 className="truncate text-lg font-semibold capitalize text-white transition-colors group-hover:text-sky-400">{drug.drug_name}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${levelStyles[level]}`}>{level}</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      {drug.total_reports} reports · Deaths: {drug.death_reports} · Top: {drug.top_reactions?.slice(0, 2).join(', ')}
                    </p>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className={`text-3xl font-black ${level === 'critical' ? 'text-red-400' : level === 'high' ? 'text-orange-400' : level === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {drug.risk_score}
                    </p>
                    <p className="text-xs text-slate-500">Risk Score</p>
                  </div>

                  <div className="w-24 flex-shrink-0">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className={`h-full rounded-full ${level === 'critical' ? 'bg-red-500' : level === 'high' ? 'bg-orange-500' : level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${drug.risk_score}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}
