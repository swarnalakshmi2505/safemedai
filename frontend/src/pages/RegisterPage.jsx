import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'doctor', license_number: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await registerUser(form)
      navigate('/', {
        replace: true,
        state: { message: 'Registered successfully. Please log in.' },
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Account</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Full Name" value={form.full_name} onChange={e => setForm(p => ({...p, full_name: e.target.value}))} className="border px-3 py-2 rounded-md" />
          <input required type="email" placeholder="you@hospital.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="border px-3 py-2 rounded-md" />
          <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} className="border px-3 py-2 rounded-md" />

          <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))} className="border px-3 py-2 rounded-md">
            <option value="doctor">Doctor</option>
            <option value="officer">Pharmacovigilance Officer</option>
          </select>

          {form.role === 'doctor' && (
            <input placeholder="Medical License Number" value={form.license_number} onChange={e => setForm(p => ({...p, license_number: e.target.value}))} className="border px-3 py-2 rounded-md" />
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded-md disabled:opacity-60">
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p className="mt-3 text-sm text-gray-600 cursor-pointer" onClick={() => navigate('/')}>Back to Login</p>
        </form>
      </div>
    </div>
  )
}
