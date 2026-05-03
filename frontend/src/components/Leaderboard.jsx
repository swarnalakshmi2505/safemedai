import { useEffect, useState } from 'react';
import { getTrackedDrugs } from '../services/api';

function initialsFor(name) {
  return (name || 'D')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Leaderboard() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getTrackedDrugs();
        if (mounted) setDrugs(res.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6 text-slate-300">Loading leaderboard...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="dashboard-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="dashboard-table w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="px-5 py-4">Rank</th>
              <th className="px-5 py-4">Drug Name</th>
              <th className="px-5 py-4">Risk Score</th>
              <th className="px-5 py-4">Adverse Events</th>
              <th className="px-5 py-4">Growth %</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/70">
            {drugs.map((d, i) => (
              <tr key={d.drug_name} className="group cursor-pointer bg-white transition hover:bg-surface-container-low/80">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[22px] font-extrabold tracking-[-0.03em] text-[#98a2b3]">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm">
                      {initialsFor(d.drug_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{d.drug_name}</p>
                      <p className="text-xs text-on-surface-variant">{d.atc_code || '-'}{d.category ? ` | ${d.category}` : ''}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-md">
                    <div className="h-1.5 w-28 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full rounded-full bg-error" style={{ width: `${Math.min(100, Math.round(d.risk_score || 0))}%` }}></div>
                    </div>
                    <span className="text-[14px] font-bold text-on-surface">{(d.risk_score || 0).toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><span className="text-[14px] font-medium text-on-surface">{d.total_reports ?? '-'}</span></td>
                <td className="px-5 py-4"><span className="text-[14px] font-semibold text-on-surface-variant">{d.growth_pct ? `${d.growth_pct}%` : '-'}</span></td>
                <td className="px-5 py-4"><span className="dashboard-soft-chip dashboard-badge-muted">{d.status || 'Stabilized'}</span></td>
                <td className="px-5 py-4 text-right"><button className="text-[14px] font-medium text-[#667085] transition hover:text-primary">More</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-outline/70 bg-surface-container-low px-5 py-4">
        <p className="text-xs text-on-surface-variant">Showing <span className="font-bold text-on-surface">1-{Math.min(drugs.length, 6)}</span> of {drugs.length} identified drug substances</p>
        <div className="flex items-center gap-sm">
          <button className="rounded-lg border border-outline bg-white p-2 text-on-surface-variant transition hover:border-primary hover:text-primary disabled:opacity-50" disabled>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="flex gap-xs">
            <button className="h-8 w-8 rounded-lg bg-primary text-xs font-bold text-on-primary">1</button>
            <button className="h-8 w-8 rounded-lg border border-outline bg-white text-xs font-bold text-on-surface-variant transition hover:border-primary hover:text-primary">2</button>
            <button className="h-8 w-8 rounded-lg border border-outline bg-white text-xs font-bold text-on-surface-variant transition hover:border-primary hover:text-primary">3</button>
            <span className="px-2 text-[#98a2b3]">...</span>
            <button className="h-8 w-8 rounded-lg border border-outline bg-white text-xs font-bold text-on-surface-variant transition hover:border-primary hover:text-primary">140</button>
          </div>
          <button className="rounded-lg border border-outline bg-white p-2 text-on-surface-variant transition hover:border-primary hover:text-primary">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
