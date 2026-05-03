import Layout from '../components/Layout';

export default function FeatureStubPage({ title, description }) {
  return (
    <Layout>
      <div className="mx-auto flex min-h-[calc(100vh-0px)] max-w-4xl items-center justify-center px-8 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 text-center shadow-2xl shadow-slate-950/30">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">Coming Soon</p>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
    </Layout>
  );
}
