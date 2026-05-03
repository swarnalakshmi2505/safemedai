import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import Layout from '../components/Layout';
import { alertsAPI } from '../services/api';

const levelStyles = {
  critical: 'border-red-500/50 bg-red-500/10',
  high: 'border-orange-500/50 bg-orange-500/10',
  medium: 'border-yellow-500/50 bg-yellow-500/10',
};

const badgeStyles = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/40',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    alertsAPI
      .getAlerts()
      .then((response) => setAlerts(response.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => {
    return {
      pending: alerts.filter((alert) => !alert.is_validated).length,
      validated: alerts.filter((alert) => alert.is_validated && !alert.is_sent).length,
      sent: alerts.filter((alert) => alert.is_sent).length,
    };
  }, [alerts]);

  const generate = async () => {
    await toast.promise(alertsAPI.generateAlerts(), {
      loading: 'Scanning risk scores...',
      success: 'Alerts generated!',
      error: 'Failed to generate alerts',
    });
    load();
  };

  const validate = async (id) => {
    await alertsAPI.validateAlert(id);
    toast.success('Alert validated');
    load();
  };

  const send = async (id) => {
    await alertsAPI.sendAlert(id);
    toast.success('Alert sent to doctors');
    load();
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-8 px-8 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Alert Management</h1>
            <p className="mt-1 text-sm text-slate-400">Review, validate, and dispatch safety alerts</p>
          </div>
          <button
            onClick={generate}
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-500"
          >
            Generate Alerts
          </button>
        </div>

        <section className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Review', count: summary.pending, color: 'text-yellow-400' },
            { label: 'Validated', count: summary.validated, color: 'text-sky-400' },
            { label: 'Sent', count: summary.sent, color: 'text-green-400' },
          ].map((entry) => (
            <div key={entry.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-center shadow-2xl shadow-slate-950/30">
              <p className={`text-2xl font-bold ${entry.color}`}>{entry.count}</p>
              <p className="mt-1 text-xs text-slate-400">{entry.label}</p>
            </div>
          ))}
        </section>

        {loading ? (
          <p className="py-12 text-center text-slate-400">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-16 text-center">
            <p className="text-lg text-slate-300">No alerts yet.</p>
            <p className="mt-2 text-sm text-slate-500">Click Generate Alerts to scan the current risk scores.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`rounded-2xl border p-5 shadow-2xl shadow-slate-950/20 ${levelStyles[alert.level] || 'border-slate-800 bg-slate-900/70'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold capitalize text-white">{alert.drug_name}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeStyles[alert.level] || badgeStyles.medium}`}>{alert.level}</span>
                      <span className="text-xs text-slate-500">Score: {alert.risk_score}</span>
                      {alert.is_sent ? <span className="text-xs text-green-400">✓ Sent</span> : null}
                      {alert.is_validated && !alert.is_sent ? <span className="text-xs text-sky-400">✓ Validated</span> : null}
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{alert.message}</p>
                    <p className="mt-2 text-xs text-slate-500">{new Date(alert.created_at).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-shrink-0 flex-col gap-2">
                    {!alert.is_validated ? (
                      <button
                        onClick={() => validate(alert.id)}
                        className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-sky-500"
                      >
                        Validate
                      </button>
                    ) : null}
                    {alert.is_validated && !alert.is_sent ? (
                      <button
                        onClick={() => send(alert.id)}
                        className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-500"
                      >
                        Send to Doctors
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
