import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, token, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin shadow-glow-blue/20"></div>
        <div className="text-center">
          <p className="text-[11px] font-black text-brand-blue uppercase tracking-[0.3em] animate-pulse">Synchronizing Security Node</p>
          <p className="text-[9px] text-surface-500 uppercase tracking-widest mt-2">Verifying Personnel Credentials...</p>
        </div>
      </div>
    </div>
  )
  if (!token || !user) return <Navigate to="/" replace />
  if (user.role !== allowedRole) return <Navigate to="/" replace />
  return children
}
