import { useEffect, useState } from 'react'
import apiClient from '../api/client'
import type { Challenge } from '../types'

export default function AdminPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    points: 100,
    flag: '', // Optional for edit, required for create
    initialConfig: '{\n  "nodes": [],\n  "links": []\n}',
    targetRequirements: '{\n  "rules": []\n}',
    isActive: true,
  })

  const fetchChallenges = async () => {
    try {
      const { data } = await apiClient.get<{ data: Challenge[] }>('/challenges?pageSize=100')
      setChallenges(data.data)
    } catch {
      setError('Failed to fetch challenges.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChallenges()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm((prev) => ({ ...prev, [name]: val }))
  }

  const handleEditClick = (c: Challenge) => {
    setEditingId(c.id)
    setForm({
      title: c.title,
      description: c.description,
      difficulty: c.difficulty,
      points: c.points,
      flag: '', // Leave blank unless changing
      initialConfig: c.initialConfig,
      targetRequirements: c.targetRequirements,
      isActive: c.isActive,
    })
    setSuccess('')
    setError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    resetForm()
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      difficulty: 'Easy',
      points: 100,
      flag: '',
      initialConfig: '{\n  "nodes": [],\n  "links": []\n}',
      targetRequirements: '{\n  "rules": []\n}',
      isActive: true,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Validate JSON fields
      try {
        JSON.parse(form.initialConfig)
        JSON.parse(form.targetRequirements)
      } catch {
        setError('Initial Configuration and Target Requirements must be valid JSON strings.')
        return
      }

      if (editingId) {
        await apiClient.put(`/challenges/${editingId}`, form)
        setSuccess('Challenge updated successfully!')
        setEditingId(null)
      } else {
        if (!form.flag) {
          setError('Flag is required for new challenges.')
          return
        }
        await apiClient.post('/challenges', form)
        setSuccess('Challenge created successfully!')
      }

      resetForm()
      fetchChallenges()
    } catch {
      setError('Failed to save challenge. Verify admin authorization.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return
    setError('')
    setSuccess('')

    try {
      await apiClient.delete(`/challenges/${id}`)
      setSuccess('Challenge deleted successfully!')
      fetchChallenges()
    } catch {
      setError('Failed to delete challenge.')
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto cyber-grid">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold gradient-text-cyan-purple">Admin Control Panel</h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          Deploy and configure CTF challenge vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Challenge Creator/Editor Form */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 h-fit box-glow-purple">
          <h2 className="text-lg font-semibold font-mono text-[var(--color-neon-purple)] mb-4">
            {editingId ? '🛠️ EDIT CHALLENGE' : '🚀 CREATE CHALLENGE'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[var(--color-text-muted)] mb-1 uppercase">Title</label>
              <input
                type="text"
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                placeholder="DNS Cache Poisoning"
                className="w-full px-3 py-2 rounded-lg input-cyber"
              />
            </div>

            <div>
              <label className="block text-[var(--color-text-muted)] mb-1 uppercase">Description</label>
              <textarea
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Write detailed instructions..."
                className="w-full px-3 py-2 rounded-lg input-cyber"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[var(--color-text-muted)] mb-1 uppercase">Difficulty</label>
                <select
                  name="difficulty"
                  value={form.difficulty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg input-cyber"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-[var(--color-text-muted)] mb-1 uppercase">Points</label>
                <input
                  type="number"
                  name="points"
                  required
                  value={form.points}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg input-cyber"
                />
              </div>
            </div>

            <div>
              <label className="block text-[var(--color-text-muted)] mb-1 uppercase">
                Flag {editingId && '(Leave blank to keep current)'}
              </label>
              <input
                type="text"
                name="flag"
                value={form.flag}
                onChange={handleChange}
                placeholder="NQ{flag_format_hash}"
                className="w-full px-3 py-2 rounded-lg input-cyber"
              />
            </div>

            <div>
              <label className="block text-[var(--color-text-muted)] mb-1 uppercase">Initial Topology (JSON)</label>
              <textarea
                name="initialConfig"
                required
                value={form.initialConfig}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 rounded-lg input-cyber text-[10px]"
              />
            </div>

            <div>
              <label className="block text-[var(--color-text-muted)] mb-1 uppercase">Target Requirements (JSON)</label>
              <textarea
                name="targetRequirements"
                required
                value={form.targetRequirements}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 rounded-lg input-cyber text-[10px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="accent-[var(--color-neon-purple)]"
              />
              <label className="text-[var(--color-text-muted)] uppercase">Challenge Active</label>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>}
            {success && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">{success}</div>}

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 rounded-lg btn-neon-cyan font-bold">
                {editingId ? 'Save Changes' : 'Publish'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-[var(--color-text-muted)] hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Challenge list table */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Challenge Registry</h2>

          {loading ? (
            <div className="text-center py-12 text-[var(--color-text-muted)] font-mono">LOADING CHALLENGES...</div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-muted)] font-mono">NO CHALLENGES CONFIGURED.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                    <th className="pb-3">TITLE</th>
                    <th className="pb-3">DIFFICULTY</th>
                    <th className="pb-3">POINTS</th>
                    <th className="pb-3">STATUS</th>
                    <th className="pb-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]/50">
                  {challenges.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 font-semibold text-[var(--color-text-primary)]">{c.title}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          c.difficulty === 'Easy' ? 'badge-easy' : c.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                        }`}>
                          {c.difficulty}
                        </span>
                      </td>
                      <td className="py-4 text-[var(--color-neon-green)] font-bold">{c.points} XP</td>
                      <td className="py-4">
                        <span className={c.isActive ? 'text-[var(--color-neon-green)]' : 'text-red-400'}>
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(c)}
                          className="px-2.5 py-1 rounded bg-slate-800 text-[var(--color-neon-cyan)] hover:bg-slate-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="px-2.5 py-1 rounded bg-red-950/40 text-red-400 hover:bg-red-900/40 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
