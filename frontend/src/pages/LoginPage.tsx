import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import { useAuthStore } from '../store/authStore'
import type { AuthResponse } from '../types'
import logo from '../assets/logo.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [form, setForm] = useState({ usernameOrEmail: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', form)
      login(
        { username: data.username, email: data.email, role: data.role, totalPoints: data.totalPoints },
        data.token
      )
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message
      setError(msg ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen cyber-grid flex items-center justify-center px-4 pt-16">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-[var(--color-neon-cyan)] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="NetQuest AI" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-[var(--color-text-muted)]">Sign in to continue your mission</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 box-glow-cyan">
          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Username or Email */}
            <div>
              <label htmlFor="login-usernameOrEmail" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Username or Email
              </label>
              <input
                id="login-usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                autoComplete="username"
                required
                value={form.usernameOrEmail}
                onChange={handleChange}
                placeholder="operator_one"
                className="w-full px-4 py-3 rounded-xl input-cyber font-mono text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl input-cyber font-mono text-sm"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] text-sm">
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-neon-green font-semibold text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            No account?{' '}
            <Link to="/register" className="text-[var(--color-neon-cyan)] hover:underline font-medium">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
