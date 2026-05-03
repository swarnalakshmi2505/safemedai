import { useEffect, useState } from 'react';
import { getTrendAlerts } from '../services/api';

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getTrendAlerts();
        if (mounted) setAlerts(res.data || []);
      } catch (err) {
        // ignore errors for feed
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6 text-slate-300">Loading alerts...</div>;
  if (!alerts.length) return <div className="p-6 text-slate-400">No alerts</div>;

  return (
    <div className="space-y-md">
      {alerts.map((a, idx) => (
        <div key={`${a.drug_name}-${idx}`} className={`group rounded-2xl border bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] ${a.severity === 'critical' ? 'border-l-4 border-l-error' : a.severity === 'high' ? 'border-l-4 border-l-tertiary' : 'border-l-4 border-l-outline'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <span className={`dashboard-soft-chip ${a.severity === 'critical' ? 'dashboard-badge-critical' : a.severity === 'high' ? 'dashboard-badge-high' : 'dashboard-badge-muted'}`}>{(a.severity || 'info').toUpperCase()}</span>
                  <h3 className="text-[18px] font-bold tracking-[-0.02em] text-on-surface">{a.drug_name}</h3>
                </div>
                <p className="max-w-3xl text-[14px] leading-6 text-on-surface-variant">{a.message}</p>
              </div>
            </div>
            <div className="flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <button className="rounded-xl border border-outline bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant transition hover:border-primary hover:text-primary">Archive</button>
              <button className="rounded-xl border border-outline bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-on-surface-variant transition hover:border-primary hover:text-primary">More</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
