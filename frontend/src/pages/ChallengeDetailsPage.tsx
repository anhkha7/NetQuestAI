import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../api/client'
import TopologyVisualizer from '../components/TopologyVisualizer'
import { useAuthStore } from '../store/authStore'
import type { Challenge, SubmissionResult } from '../types'

export default function ChallengeDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { updatePoints } = useAuthStore()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [flagInput, setFlagInput] = useState('')
  const [configInput, setConfigInput] = useState('{\n  "nodes": [],\n  "links": []\n}')
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [result, setResult] = useState<SubmissionResult | null>(null)

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const { data } = await apiClient.get<Challenge>(`/challenges/${id}`)
        setChallenge(data)
        // Pre-fill submission config with initial config template
        if (data.initialConfig) {
          try {
            // format JSON pretty
            const pretty = JSON.stringify(JSON.parse(data.initialConfig), null, 2)
            setConfigInput(pretty)
          } catch {
            setConfigInput(data.initialConfig)
          }
        }
      } catch (err: unknown) {
        setError('Failed to load challenge details.')
      } finally {
        setLoading(false)
      }
    }
    fetchChallenge()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!flagInput.trim()) return

    setSubmissionLoading(true)
    setError('')
    setResult(null)

    try {
      // Validate submitted config JSON structure
      let configPayload = configInput
      try {
        configPayload = JSON.stringify(JSON.parse(configInput))
      } catch {
        setError('Submitted configuration must be valid JSON.')
        setSubmissionLoading(false)
        return
      }

      const { data } = await apiClient.post<SubmissionResult>('/submissions', {
        challengeId: id,
        flag: flagInput.trim(),
        submittedConfig: configPayload,
      })

      setResult(data)
      if (data.isPassed && challenge) {
        // Increment points in global state locally
        const store = useAuthStore.getState()
        const currentPoints = store.user?.totalPoints ?? 0
        updatePoints(currentPoints + challenge.points)
      }
    } catch (err: unknown) {
      setError('Submission failed. Please check backend log.')
    } finally {
      setSubmissionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-[var(--color-neon-cyan)]">
        <span className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mr-3" />
        DECRYPTING CHALLENGE DATA...
      </div>
    )
  }

  if (error && !challenge) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
          ⚠ {error}
        </div>
        <Link to="/challenges" className="btn-neon-cyan px-6 py-2 rounded-lg">Back to Challenges</Link>
      </div>
    )
  }

  if (!challenge) return null

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto cyber-grid">
      {/* Breadcrumb */}
      <div className="mb-6 animate-fade-in-up">
        <Link to="/challenges" className="text-xs text-[var(--color-neon-cyan)] hover:underline font-mono">
          ← BACK TO MISSION CONTROL
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Challenge Details & Code Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details header */}
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
                {challenge.title}
              </h1>
              <span className={`px-2.5 py-1 text-xs rounded font-mono uppercase ${
                challenge.difficulty === 'Easy' ? 'badge-easy' : challenge.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
              }`}>
                {challenge.difficulty}
              </span>
            </div>

            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed whitespace-pre-wrap">
              {challenge.description}
            </p>

            <div className="flex items-center gap-4 text-xs font-mono text-[var(--color-neon-green)] border-t border-[var(--color-border)]/50 pt-4">
              <span>Points: {challenge.points} XP</span>
              <span>•</span>
              <span>Status: Active</span>
            </div>
          </div>

          {/* Submission Config Editor */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold font-mono text-[var(--color-neon-cyan)] mb-3">
              📝 SUBMITTED NETWORK CONFIGURATION (JSON)
            </h2>
            <textarea
              value={configInput}
              onChange={(e) => setConfigInput(e.target.value)}
              className="w-full h-80 px-4 py-3 rounded-xl input-cyber font-mono text-xs leading-relaxed resize-y"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Flag Submission Form */}
          <div className="glass-card rounded-2xl p-6 box-glow-cyan">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[var(--color-text-muted)] mb-2 uppercase">
                  🔑 Flag Submission
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    placeholder="NQ{flag_format_string}"
                    className="flex-1 px-4 py-3 rounded-xl input-cyber font-mono text-sm"
                  />
                  <button
                    type="submit"
                    disabled={submissionLoading}
                    className="px-6 py-3 rounded-xl btn-neon-green font-mono text-sm uppercase font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {submissionLoading ? 'Evaluating...' : 'Submit Flag'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
                  ⚠ {error}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right column: Topology Graph & AI feedback */}
        <div className="space-y-6">
          {/* Topology Visualizer */}
          <div className="h-[480px]">
            <TopologyVisualizer configJson={configInput} />
          </div>

          {/* Submission feedback */}
          {result && (
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border)] pb-3">
                <h3 className="font-semibold text-sm font-mono text-[var(--color-neon-purple)] uppercase">
                  🤖 AI Evaluation Report
                </h3>
                <span className={`px-2.5 py-0.5 text-xs rounded font-mono ${
                  result.isPassed ? 'badge-easy' : 'badge-hard'
                }`}>
                  {result.isPassed ? '✓ SOLVED' : '✗ FAILED'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-[var(--color-border)]/40 font-mono text-xs">
                  <span>Score: {result.score} XP</span>
                  <span>Date: {new Date(result.submittedAt).toLocaleDateString()}</span>
                </div>

                <div className="text-xs text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap font-mono prose prose-invert bg-slate-950/50 p-4 rounded-xl border border-[var(--color-border)]/20">
                  {result.aiFeedback || 'Generating AI network design audit reports...'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
