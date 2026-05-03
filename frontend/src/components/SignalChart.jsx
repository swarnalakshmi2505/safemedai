import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getTrackedDrugs } from '../services/api';

export default function SignalChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getTrackedDrugs();
        const drugs = res.data || [];
        const top = drugs
          .slice()
          .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
          .slice(0, 8)
          .map((d) => ({ name: d.drug_name, value: Math.round(d.risk_score || 0) }));
        if (mounted) setData(top);
      } catch (err) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (!data.length) return <div className="p-6 text-slate-300">No chart data</div>;

  return (
    <div className="dashboard-surface p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-on-surface">Signal Growth Forecast</h3>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="h-3 w-3 rounded-full bg-error"></span>
          <span>High Risk</span>
          </div>
        </div>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#667085' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#667085' }} width={32} />
            <Tooltip
              cursor={{ fill: 'rgba(43, 76, 126, 0.06)' }}
              contentStyle={{
                borderRadius: '14px',
                border: '1px solid #d0d5dd',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              }}
            />
            <Bar dataKey="value" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={72} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
