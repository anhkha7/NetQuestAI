import { useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import apiClient from '../api/client'
import { useAuthStore } from '../store/authStore'

interface LeaderboardUser {
  id: string
  username: string
  totalPoints: number
  role: string
}

interface LiveNotification {
  id: string
  user: string
  message: string
  timestamp: Date
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<LiveNotification[]>([])

  const fetchLeaderboard = async () => {
    try {
      const { data } = await apiClient.get<LeaderboardUser[]>('/leaderboard')
      setUsers(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()

    // Setup SignalR connection for Real-time broadcasts
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications')
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveNotification', (user: string, message: string) => {
      // Append new solving notify
      const newNotify: LiveNotification = {
        id: Math.random().toString(),
        user,
        message,
        timestamp: new Date(),
      }
      setNotifications((prev) => [newNotify, ...prev].slice(0, 10))
      
      // Auto refetch scores
      fetchLeaderboard()
    })

    connection.start().catch(() => {
      // Ignore websocket startup failures in dev
    })

    return () => {
      connection.stop()
    }
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto cyber-grid">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="pulse-dot" />
          <span className="text-xs font-mono text-[var(--color-neon-green)]">REAL-TIME TELEMETRY</span>
        </div>
        <h1 className="text-3xl font-extrabold gradient-text-green-cyan">Global Leaderboard</h1>
        <p className="text-[var(--color-text-muted)] text-sm">
          Dynamic scoring grid showing network CTF elite operators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard Table Grid */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          {loading ? (
            <div className="text-center py-12 text-[var(--color-text-muted)] font-mono">RETRIEVING INTEL SCOREBOARD...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-muted)] font-mono">NO ACTIVE OPERATORS FOUND.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                    <th className="pb-3 w-16">RANK</th>
                    <th className="pb-3">OPERATOR</th>
                    <th className="pb-3">ROLE</th>
                    <th className="pb-3 text-right">POINTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]/40">
                  {users.map((u, idx) => {
                    const rank = idx + 1
                    const isSelf = currentUser?.username === u.username
                    const getMedal = () => {
                      if (rank === 1) return '🥇'
                      if (rank === 2) return '🥈'
                      if (rank === 3) return '🥉'
                      return `#${rank}`
                    }

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-slate-900/40 transition-colors ${
                          isSelf ? 'bg-slate-900/60 border-y border-[var(--color-neon-cyan)]/30' : ''
                        }`}
                      >
                        <td className="py-4 font-bold text-sm">
                          <span className={rank <= 3 ? 'text-lg' : 'text-[var(--color-text-muted)]'}>
                            {getMedal()}
                          </span>
                        </td>
                        <td className="py-4 font-semibold">
                          <span className={isSelf ? 'text-[var(--color-neon-cyan)] font-black' : 'text-[var(--color-text-primary)]'}>
                            {u.username}
                          </span>
                          {isSelf && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)] uppercase">YOU</span>}
                        </td>
                        <td className="py-4 uppercase text-[10px] text-[var(--color-text-muted)]">{u.role}</td>
                        <td className="py-4 text-right font-bold text-[var(--color-neon-green)] text-sm">
                          {u.totalPoints} XP
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live notification feed */}
        <div className="glass-card rounded-2xl p-6 box-glow-green h-fit">
          <h2 className="text-sm font-semibold font-mono text-[var(--color-neon-green)] mb-4 border-b border-[var(--color-border)] pb-2 uppercase tracking-wider">
            📡 Live Solves Feed
          </h2>

          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--color-text-muted)] font-mono italic">
              Awaiting solver payloads...
            </div>
          ) : (
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-[var(--color-border)]/50 font-mono text-[11px] animate-fade-in-up"
                >
                  <div className="flex justify-between items-center text-[var(--color-text-muted)] mb-1">
                    <span className="text-[var(--color-neon-cyan)] font-bold">@{n.user}</span>
                    <span>{n.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[var(--color-text-primary)] leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
