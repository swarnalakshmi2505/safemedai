import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import Layout from '../components/Layout';
import { analyticsAPI, dataAPI } from '../services/api';

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

const COLORS = ['#38bdf8', '#f87171', '#fbbf24', '#34d399', '#a78bfa', '#fb7185'];

export default function DrugDetails() {
  const { drugName } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [demographics, setDemographics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [detailRes, demographicsRes, trendsRes] = await Promise.all([
          analyticsAPI.getDrugDetail(drugName),
          analyticsAPI.getDemographics(drugName),
          dataAPI.getTrends(drugName),
        ]);

        if (!mounted) return;

        if (detailRes.data?.error) {
          setError(detailRes.data.error);
          return;
        }

        setDetail(detailRes.data);
        setDemographics(demographicsRes.data);
        setTrends(trendsRes.data || []);
      } catch (err) {
        if (mounted) {
          setError('Failed to load drug details. Please try again.');
          console.error(err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [drugName]);

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg text-sky-400 animate-pulse">Loading drug details...</div>
        </div>
      </Layout>
    );
  }

  if (error || !detail) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl space-y-8 px-8 py-8">
          <button
            onClick={() => navigate('/officer/search')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
          >
            ← Back to Search
          </button>
          <div className="rounded-xl border border-red-700 bg-red-900/30 px-5 py-4 text-sm text-red-300">{error || 'Drug not found'}</div>
        </div>
      </Layout>
    );
  }

  const riskProfile = detail.risk_profile || {};
  const level = getLevel(riskProfile.risk_score || 0);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-8 px-8 py-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/officer/search')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate('/officer/leaderboard')}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
          >
            View Leaderboard
          </button>
        </div>

        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold capitalize text-white">{detail.drug_name}</h1>
              <p className="mt-3 text-base leading-7 text-slate-300">{riskProfile.explanation || 'No description available'}</p>
            </div>
            <div className="flex-shrink-0 rounded-2xl border border-slate-700 bg-slate-800/50 p-6 text-center">
              <div className={`text-5xl font-black ${level === 'critical' ? 'text-red-400' : level === 'high' ? 'text-orange-400' : level === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                {(riskProfile.risk_score || 0).toFixed(1)}
              </div>
              <div className="mt-2 text-xs text-slate-500">Risk Score</div>
              <div className={`mt-3 rounded-full border px-3 py-1 text-xs font-bold capitalize ${levelStyles[level]}`}>{level}</div>
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Strongest ROR', value: (riskProfile.strongest_ror || 0).toFixed(2), suffix: 'x' },
            { label: 'Death Rate', value: (riskProfile.death_rate || 0).toFixed(2), suffix: '%' },
            { label: 'Serious Rate', value: (riskProfile.serious_rate || 0).toFixed(2), suffix: '%' },
            { label: 'Signal Count', value: riskProfile.signal_count || 0 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-sm text-slate-400">{stat.label}</div>
              <div className="mt-2 text-2xl font-bold text-white">
                {stat.value}
                {stat.suffix}
              </div>
            </div>
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Trend Chart */}
          {trends && trends.length > 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
              <h3 className="mb-4 text-base font-semibold text-white">Yearly Trend</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="report_count" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} name="Reports" />
                    <Line type="monotone" dataKey="serious_count" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} name="Serious" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Demographics: Age Groups */}
          {demographics?.age_groups && demographics.age_groups.length > 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
              <h3 className="mb-4 text-base font-semibold text-white">Reports by Age Group</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={demographics.age_groups}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="group" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Demographics: Gender */}
          {demographics?.gender && demographics.gender.length > 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
              <h3 className="mb-4 text-base font-semibold text-white">Gender Distribution</h3>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={demographics.gender}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {demographics.gender.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </section>

        {/* ROR Signals Table */}
        {detail.ror_signals && detail.ror_signals.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <h3 className="mb-4 text-base font-semibold text-white">Adverse Reaction Signals (ROR Analysis)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-400">Reaction</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">ROR</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">CI Lower</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">CI Upper</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-slate-400">Signal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {detail.ror_signals.slice(0, 10).map((signal, index) => (
                    <tr key={index} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 capitalize text-slate-200">{signal.reaction}</td>
                      <td className="px-4 py-3 text-center text-white font-semibold">{(signal.ror || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-slate-300">{(signal.ci_lower || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-slate-300">{(signal.ci_upper || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${signal.confirmed ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {signal.confirmed ? 'Confirmed' : 'Potential'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Evidence Sources */}
        {detail.evidence_sources && detail.evidence_sources.length > 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <h3 className="mb-4 text-base font-semibold text-white">External Evidence Sources</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {detail.evidence_sources.map((source, index) => (
                <div key={index} className="rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
                  <div className="text-sm font-semibold capitalize text-white">{source.source}</div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-sky-400">{source.mention_count}</div>
                    <div className="text-xs text-slate-500">mentions</div>
                  </div>
                  {source.matched_terms && source.matched_terms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {source.matched_terms.slice(0, 3).map((term, i) => (
                        <span key={i} className="rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-300">
                          {term}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Context */}
        {detail.clinical_context && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
            <h3 className="mb-4 text-base font-semibold text-white">FDA Label Information</h3>
            <div className="space-y-4 text-sm leading-7 text-slate-300">{detail.clinical_context || 'No clinical information available'}</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
