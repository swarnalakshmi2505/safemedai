import { useEffect, useState } from 'react';
import { getTrackedDrugs } from '../services/api';

export default function StatsGrid() {
  const [stats, setStats] = useState({ highRisk: 0, totalReports: 0, monitoredSites: 0 });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getTrackedDrugs();
        const drugs = res.data || [];
        const highRisk = drugs.filter((d) => (d.risk_score || 0) >= 70).length;
        const totalReports = drugs.reduce((s, d) => s + (d.total_reports || 0), 0);
        const monitoredSites = drugs.length; // proxy: number of tracked drugs
        if (mounted) setStats({ highRisk, totalReports, monitoredSites });
      } catch (err) {
        // ignore - keep defaults
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <div className="dashboard-stat">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-error-container text-error">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </span>
            <span className="text-[13px] font-semibold text-error">+3.0%</span>
          </div>
        </div>
        <div>
          <p className="dashboard-section-title mb-1">High Risk Entities</p>
          <p className="text-[28px] font-extrabold tracking-[-0.03em] text-on-surface">{stats.highRisk} Drugs</p>
        </div>
      </div>

      <div className="dashboard-stat">
        <div className="mb-5 flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-primary">
            <span className="material-symbols-outlined text-[22px]">medical_services</span>
          </span>
          <span className="text-[13px] font-semibold text-primary">{(stats.totalReports / 1000).toFixed(1)}k Total</span>
        </div>
        <div>
          <p className="dashboard-section-title mb-1">Active Monitoring</p>
          <p className="text-[28px] font-extrabold tracking-[-0.03em] text-on-surface">{stats.monitoredSites} Sites</p>
        </div>
      </div>

      <div className="dashboard-stat">
        <div className="mb-5 flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-secondary">
            <span className="material-symbols-outlined text-[22px]">speed</span>
          </span>
          <span className="text-[13px] font-semibold text-secondary">0.1% Acc</span>
        </div>
        <div>
          <p className="dashboard-section-title mb-1">AI Inference Speed</p>
          <p className="text-[28px] font-extrabold tracking-[-0.03em] text-on-surface">255 ms</p>
        </div>
      </div>

      <div className="dashboard-stat border-error/30 bg-error-container/40 relative overflow-hidden">
        <div className="relative z-10">
          <div className="mb-5 flex items-start justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-error text-white">
              <span className="material-symbols-outlined text-[22px]">bolt</span>
            </span>
            <span className="dashboard-soft-chip bg-error text-white">Urgent</span>
          </div>
          <p className="dashboard-section-title mb-1">Critical Signal Detection</p>
          <p className="text-[28px] font-extrabold tracking-[-0.03em] text-on-surface">Top Signals</p>
        </div>
      </div>
    </div>
  );
}
