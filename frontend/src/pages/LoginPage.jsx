import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(location.state?.message || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = await login(form.email, form.password)
      setSuccess('Login successful.')
      setTimeout(() => {
        navigate(data.role === 'officer' ? '/officer/dashboard' : '/doctor/dashboard')
      }, 700)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">SafeMedAI</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" required placeholder="you@hospital.com"
            value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
            className="border px-3 py-2 rounded-md" />

          <input type="password" required placeholder="Password"
            value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
            className="border px-3 py-2 rounded-md" />

          {success && <div className="text-green-600 text-sm">{success}</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-md disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">No account? <span className="text-blue-600 cursor-pointer" onClick={() => navigate('/register')}>Register</span></p>
      </div>
    </div>
  )
}
