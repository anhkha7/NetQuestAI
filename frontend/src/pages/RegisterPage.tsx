import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import { useAuthStore } from '../store/authStore'
import type { AuthResponse } from '../types'
import logo from '../assets/logo.png'

const passwordStrength = (pw: string) => {
  if (pw.length === 0) return null
  if (pw.length < 8) return { label: 'Too short', color: '#f87171' }
  if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Weak', color: '#fbbf24' }
  if (pw.length >= 12 && /[^a-zA-Z0-9]/.test(pw)) return { label: 'Strong', color: '#00ff88' }
  return { label: 'Good', color: '#00d4ff' }
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = passwordStrength(form.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', form)
      login(
        { username: data.username, email: data.email, role: data.role, totalPoints: data.totalPoints },
        data.token
      )
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setError(msg ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen cyber-grid flex items-center justify-center px-4 pt-16 pb-8">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-[var(--color-neon-purple)] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="NetQuest AI" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-[var(--color-text-muted)]">Create your operator account</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 box-glow-purple">
          <form id="register-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="register-username" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Username
              </label>
              <input
                id="register-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                maxLength={50}
                value={form.username}
                onChange={handleChange}
                placeholder="operator_one"
                className="w-full px-4 py-3 rounded-xl input-cyber font-mono text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Email
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl input-cyber font-mono text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 rounded-xl input-cyber font-mono text-sm"
              />
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        background: strength.color,
                        width: strength.label === 'Too short' ? '20%' : strength.label === 'Weak' ? '45%' : strength.label === 'Good' ? '70%' : '100%',
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] text-sm">
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-neon-cyan font-semibold text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-neon-green)] hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
