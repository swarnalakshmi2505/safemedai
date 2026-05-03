import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import Layout from '../components/Layout';
import api from '../services/api';

export default function DrugSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.get(`/drugs/${query.trim().toLowerCase()}`);
      setResult(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Drug not found in database. Try running data ingestion first.');
    } finally {
      setLoading(false);
    }
  };

  const levelColor = (level) =>
    ({
      critical: 'text-red-400',
      high: 'text-orange-400',
      medium: 'text-yellow-400',
      low: 'text-green-400',
    }[level] || 'text-slate-400');

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-8 px-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Drug Search</h1>
          <p className="mt-1 text-sm text-slate-400">Search any medicine for its full safety profile</p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && search()}
              placeholder="e.g. warfarin, ibuprofen, metformin..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-sky-500"
            />
          </div>
          <button
            onClick={search}
            disabled={loading}
            className="rounded-xl bg-sky-600 px-6 py-3 font-medium text-white transition-colors hover:bg-sky-500 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-700 bg-red-900/30 px-5 py-4 text-sm text-red-300">{error}</div>
        ) : null}

        {result ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="mb-2 text-2xl font-bold capitalize text-white">{result.drug_name}</h2>
                  <p className="text-sm leading-7 text-slate-300">{result.explanation}</p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <p className={`text-4xl font-black ${levelColor(result.risk_level)}`}>{result.risk_score}</p>
                  <p className="text-xs text-slate-500">Risk Score</p>
                  <span className={`mt-1 block text-xs capitalize ${levelColor(result.risk_level)}`}>{result.risk_level}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Strongest ROR', value: result.strongest_ror, suffix: 'x' },
                { label: 'Death Rate', value: `${result.death_rate}%` },
                { label: 'Serious Rate', value: `${result.serious_rate}%` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center shadow-2xl shadow-slate-950/20">
                  <p className="text-xl font-bold text-white">{stat.value}{stat.suffix || ''}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/20">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">FDA / Evidence Summary</h3>
                <div className="text-xs text-slate-500">{result.signal_count} signals</div>
              </div>
              <div className="space-y-4 text-sm text-slate-300">
                <p><span className="text-slate-500">Trend:</span> {result.trend_direction} ({result.trend_magnitude})</p>
                <p><span className="text-slate-500">Signal Count:</span> {result.signal_count}</p>
              </div>
              <button
                onClick={() => navigate(`/officer/drug/${encodeURIComponent(result.drug_name)}`)}
                className="mt-6 rounded-xl bg-sky-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-sky-500"
              >
                View Full Profile →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
