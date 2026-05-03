import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <main className="min-h-screen pl-56">{children}</main>
    </div>
  );
}
