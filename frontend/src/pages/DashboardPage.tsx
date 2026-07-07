import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import { useAuthStore } from '../store/authStore'
import type { ChallengeSummary, PaginatedResponse, Submission } from '../types'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadingChallenges, setLoadingChallenges] = useState(true)
  const [loadingSubmissions, setLoadingSubmissions] = useState(true)

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data } = await apiClient.get<PaginatedResponse<ChallengeSummary>>('/challenges?pageSize=6')
        setChallenges(data.data)
      } catch {
        // Challenges may be empty on fresh install
      } finally {
        setLoadingChallenges(false)
      }
    }

    const fetchSubmissions = async () => {
      try {
        const { data } = await apiClient.get<Submission[]>('/submissions/my')
        setSubmissions(data.slice(0, 5))
      } catch {
        // No submissions yet
      } finally {
        setLoadingSubmissions(false)
      }
    }

    fetchChallenges()
    fetchSubmissions()
  }, [])

  const solved = submissions.filter((s) => s.isPassed).length
  const difficultyClass = (d: string) =>
    d === 'Easy' ? 'badge-easy' : d === 'Medium' ? 'badge-medium' : 'badge-hard'

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="pulse-dot" />
            <span className="text-sm font-mono text-[var(--color-neon-green)]">SYSTEM ONLINE</span>
          </div>
          <h1 className="text-4xl font-bold">
            Welcome, <span className="gradient-text-green-cyan">{user?.username}</span>
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">
            Role: <span className="font-mono text-[var(--color-neon-cyan)]">{user?.role}</span>
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Points', value: user?.totalPoints ?? 0, unit: 'pts', color: 'var(--color-neon-green)', glow: 'box-glow-green' },
            { label: 'Solved', value: solved, unit: 'challenges', color: 'var(--color-neon-cyan)', glow: 'box-glow-cyan' },
            { label: 'Submitted', value: submissions.length, unit: 'attempts', color: 'var(--color-neon-purple)', glow: 'box-glow-purple' },
            { label: 'Available', value: challenges.length, unit: 'challenges', color: '#fbbf24', glow: '' },
          ].map((s) => (
            <div key={s.label} className={`glass-card rounded-xl p-5 ${s.glow}`}>
              <p className="text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-wider mb-1">{s.label}</p>
              <p className="text-3xl font-extrabold font-mono" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">{s.unit}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenges panel */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  <span className="gradient-text-green-cyan">Active</span> Challenges
                </h2>
                <Link to="/challenges" className="text-sm text-[var(--color-neon-cyan)] hover:underline">
                  View all →
                </Link>
              </div>

              {loadingChallenges ? (
                <div className="flex items-center justify-center h-40 text-[var(--color-text-muted)]">
                  <span className="w-6 h-6 border-2 border-[var(--color-neon-cyan)] border-t-transparent rounded-full animate-spin mr-3" />
                  Loading challenges...
                </div>
              ) : challenges.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                  <p className="text-4xl mb-3">🚧</p>
                  <p className="font-mono">No challenges yet.</p>
                  <p className="text-sm mt-1">Admins can add challenges via the API.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {challenges.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-neon-cyan)]/40 transition-all duration-200 group"
                    >
                      <div>
                        <p className="font-medium group-hover:text-[var(--color-neon-cyan)] transition-colors">{c.title}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded font-mono ${difficultyClass(c.difficulty)}`}>
                          {c.difficulty}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-[var(--color-neon-green)]">{c.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent submissions */}
          <div>
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-6">
                Recent <span className="gradient-text-cyan-purple">Activity</span>
              </h2>

              {loadingSubmissions ? (
                <div className="flex items-center justify-center h-40 text-[var(--color-text-muted)]">
                  <span className="w-5 h-5 border-2 border-[var(--color-neon-cyan)] border-t-transparent rounded-full animate-spin mr-2" />
                  Loading...
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-text-muted)]">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="font-mono text-sm">No submissions yet.</p>
                  <p className="text-xs mt-1">Start a challenge to see activity here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{s.challengeTitle}</p>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded font-mono ${s.isPassed ? 'badge-easy' : 'badge-hard'}`}>
                          {s.isPassed ? '✓ PASS' : '✗ FAIL'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] font-mono mt-1">
                        +{s.score} pts · {new Date(s.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
