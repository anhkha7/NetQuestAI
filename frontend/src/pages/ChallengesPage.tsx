import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/client'
import type { ChallengeSummary, PaginatedResponse } from '../types'

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([])
  const [difficultyFilter, setDifficultyFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchChallenges = async () => {
    setLoading(true)
    setError('')
    try {
      let url = '/challenges?pageSize=100'
      if (difficultyFilter) {
        url += `&difficulty=${difficultyFilter}`
      }
      const { data } = await apiClient.get<PaginatedResponse<ChallengeSummary>>(url)
      setChallenges(data.data)
    } catch {
      setError('Failed to retrieve challenges from mission control.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChallenges()
  }, [difficultyFilter])

  const difficultyClass = (d: string) =>
    d === 'Easy' ? 'badge-easy' : d === 'Medium' ? 'badge-medium' : 'badge-hard'

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto cyber-grid">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold gradient-text-green-cyan">Mission Matrix</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Analyze subnets, secure topologies, and capture flag hashes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 font-mono text-xs">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 rounded-xl input-cyber"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[var(--color-text-muted)] font-mono">
          SCANNING FOR TARGET VECTORS...
        </div>
      ) : error ? (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono text-center">
          ⚠ {error}
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-text-muted)] font-mono">
          NO ACTIVE CHALLENGES MATCHED.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((c) => (
            <div
              key={c.id}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-[var(--color-neon-cyan)]/60 transition-all duration-300 group box-glow-cyan"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <span className={`px-2 py-0.5 text-[10px] rounded font-mono uppercase ${difficultyClass(c.difficulty)}`}>
                    {c.difficulty}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--color-neon-green)]">
                    +{c.points} XP
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-neon-cyan)] transition-colors mb-2">
                  {c.title}
                </h3>
                
                <p className="text-xs text-[var(--color-text-muted)] font-mono mb-6">
                  Target: Verify topology & capture flag
                </p>
              </div>

              <Link
                to={`/challenges/${c.id}`}
                className="w-full text-center py-2.5 rounded-xl btn-neon-green font-mono text-xs uppercase font-semibold inline-block"
              >
                Launch Challenge →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
