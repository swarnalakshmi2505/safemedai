import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import Layout from '../components/Layout'
import api    from '../services/api'

// ── tiny helpers ──────────────────────────────────────────────────────────────
const levelStyle = {
  critical: { badge: 'bg-red-500/20 text-red-400 border-red-500/40',   bar: 'bg-red-500',    text: 'text-red-400'    },
  high:     { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40', bar: 'bg-orange-500', text: 'text-orange-400' },
  medium:   { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', bar: 'bg-yellow-500', text: 'text-yellow-400' },
  low:      { badge: 'bg-green-500/20 text-green-400 border-green-500/40',   bar: 'bg-green-500',  text: 'text-green-400'  },
}

const signalBadge = (sig, confirmed) => {
  if (!confirmed) return 'text-slate-400 bg-slate-700/50'
  if (sig === 'strong')   return 'text-red-400    bg-red-500/20'
  if (sig === 'moderate') return 'text-yellow-400 bg-yellow-500/20'
  return                         'text-sky-400    bg-sky-500/20'
}

function StatBox({ label, value, sub }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-xs mt-1">{label}</p>
      {sub && <p className="text-slate-500 text-xs">{sub}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function DrugDetailPage() {
  const { drugName } = useParams()
  const navigate     = useNavigate()
  const [drug,    setDrug]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!drugName) return
    setLoading(true); setError('')
    api.get(`/drugs/${drugName.toLowerCase()}`)
      .then(r => setDrug(r.data))
      .catch(err => {
        const msg = err.response?.data?.detail || 'Failed to load drug details.'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [drugName])

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="text-sky-400 animate-pulse">Loading drug profile...</div>
      </div>
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-12">
        <button onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-2">
          ← Back
        </button>
        <div className="bg-red-900/20 border border-red-700 rounded-2xl p-6 text-red-300">
          <p className="font-semibold mb-1">Could not load drug data</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs text-red-400 mt-3">
            Make sure you have run Data Ingestion from the Dashboard first.
          </p>
        </div>
      </div>
    </Layout>
  )

  const ls = levelStyle[drug.risk_level] || levelStyle.low

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white text-sm flex items-center gap-2 mb-2">
          ← Back
        </button>

        {/* ── Hero card ── */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-7">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-3xl font-black text-white capitalize">
                  {drug.drug_name}
                </h1>
                <span className={`text-xs px-3 py-1 rounded-full border font-medium capitalize
                                  ${ls.badge}`}>
                  {drug.risk_level}
                </span>
                <span className="text-xs text-slate-500">
                  {drug.total_reports} FDA reports
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {drug.explanation}
              </p>
            </div>

            {/* Risk score circle */}
            <div className="flex-shrink-0 text-center bg-slate-700/40 rounded-2xl px-8 py-5
                            border border-slate-600">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                Risk Score
              </p>
              <p className={`text-5xl font-black ${ls.text}`}>{drug.risk_score}</p>
              <div className="w-24 h-2 bg-slate-600 rounded-full mt-3 mx-auto overflow-hidden">
                <div className={`h-full rounded-full ${ls.bar}`}
                     style={{ width: `${drug.risk_score}%` }} />
              </div>
              <p className={`text-xs mt-2 capitalize font-medium ${ls.text}`}>
                {drug.risk_level}
              </p>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatBox label="Strongest ROR"   value={`${drug.strongest_ror}x`} />
            <StatBox label="Death Rate"      value={`${drug.death_rate}%`} />
            <StatBox label="Serious Rate"    value={`${drug.serious_rate}%`} />
            <StatBox label="Signal Count"    value={drug.signal_count}
                     sub="Confirmed ROR signals" />
          </div>
        </div>

        {/* ── Uses / Pros / Cons ── */}
        <Section title="Uses">
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-6">
            {drug.uses}
          </p>
        </Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="✅ Pros (Clinical Benefits)">
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-8">
              {drug.pros}
            </p>
          </Section>
          <Section title="⚠️ Cons (Warnings & Adverse Reactions)">
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-8">
              {drug.cons}
            </p>
          </Section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="🚫 Who Should Avoid">
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-6">
              {drug.who_should_avoid}
            </p>
          </Section>
          <Section title="💊 Dosage">
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-6">
              {drug.dosage}
            </p>
          </Section>
        </div>

        {/* ── ROR Signals table ── */}
        <Section title="📊 ROR Signal Detection">
          <p className="text-slate-500 text-xs mb-4">
            Reporting Odds Ratio — values above 1 with CI lower &gt; 1 indicate
            a confirmed pharmacovigilance signal.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 pr-4">Reaction</th>
                  <th className="text-left pb-3 pr-4">ROR</th>
                  <th className="text-left pb-3 pr-4">95% CI</th>
                  <th className="text-left pb-3">Signal</th>
                </tr>
              </thead>
              <tbody>
                {drug.ror_signals.map((sig, i) => (
                  <tr key={i}
                      className="border-b border-slate-700/40 hover:bg-slate-700/20">
                    <td className="py-3 pr-4 text-slate-200">{sig.reaction}</td>
                    <td className="py-3 pr-4 font-mono font-semibold text-white">
                      {sig.ror}
                    </td>
                    <td className="py-3 pr-4 text-slate-400 font-mono text-xs">
                      {sig.ci_lower} – {sig.ci_upper}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                                        ${signalBadge(sig.signal, sig.confirmed)}`}>
                        {sig.confirmed ? `${sig.signal} ✓` : sig.signal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Yearly Trend chart ── */}
        {drug.yearly_trends?.length > 0 && (
          <Section title="📈 Yearly Report Trend">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={drug.yearly_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="report_count"
                      stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} name="Reports" />
                <Line type="monotone" dataKey="serious_count"
                      stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} name="Serious" />
              </LineChart>
            </ResponsiveContainer>
            <p className={`text-xs mt-3 font-medium ${
              drug.trend_direction === 'increasing' ? 'text-red-400' :
              drug.trend_direction === 'decreasing' ? 'text-green-400' : 'text-slate-400'
            }`}>
              Trend: {drug.trend_direction}
              {drug.trend_magnitude !== 0 && ` (${drug.trend_magnitude > 0 ? '+' : ''}${drug.trend_magnitude}%)`}
            </p>
          </Section>
        )}

        {/* ── Demographics ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="👥 Gender Distribution">
            <div className="space-y-3">
              {Object.entries(drug.gender_distribution || {}).map(([gender, count]) => {
                const pct = Math.round((count / drug.total_reports) * 100)
                return (
                  <div key={gender}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 capitalize">{gender}</span>
                      <span className="text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full"
                           style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>

          <Section title="🧬 Age Group Distribution">
            <div className="space-y-3">
              {Object.entries(drug.age_distribution || {}).map(([age, count]) => {
                const pct = Math.round((count / drug.total_reports) * 100)
                return (
                  <div key={age}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 capitalize">{age}</span>
                      <span className="text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full"
                           style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        </div>

        {/* ── Evidence Sources ── */}
        <Section title="🔬 Evidence Sources">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/40 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">FDA Label</p>
              <p className="text-white font-semibold">openFDA Drug Label API</p>
              <p className={`text-xs mt-1 ${drug.evidence?.fda_label ? 'text-green-400' : 'text-slate-500'}`}>
                {drug.evidence?.fda_label ? '✓ Data available' : '— Not found'}
              </p>
            </div>
            <div className="bg-slate-700/40 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">PubMed</p>
              <p className="text-white font-semibold">
                {drug.evidence?.pubmed_count?.toLocaleString() || 0} papers
              </p>
              <p className="text-xs text-slate-500 mt-1">Safety-related publications</p>
            </div>
            <div className="bg-slate-700/40 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">FAERS Database</p>
              <p className="text-white font-semibold">
                {drug.evidence?.faers_reports?.toLocaleString() || 0} reports
              </p>
              <p className="text-xs text-slate-500 mt-1">Adverse event reports</p>
            </div>
          </div>
        </Section>

      </div>
    </Layout>
  )
}
