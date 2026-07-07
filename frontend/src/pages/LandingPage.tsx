import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const features = [
  {
    icon: '🌐',
    title: 'Network Challenges',
    description: 'Hands-on CTF challenges covering routing, firewall config, VLANs, intrusion detection, and more.',
    color: 'var(--color-neon-green)',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Feedback',
    description: 'Get instant, intelligent analysis of your network configurations with actionable improvement tips.',
    color: 'var(--color-neon-cyan)',
  },
  {
    icon: '🏆',
    title: 'Competitive Leaderboard',
    description: 'Compete with peers, earn points, and track your progress on a real-time global leaderboard.',
    color: 'var(--color-neon-purple)',
  },
  {
    icon: '📡',
    title: 'Real-world Scenarios',
    description: 'Practice in simulated enterprise environments — from small office setups to complex data centers.',
    color: 'var(--color-neon-green)',
  },
]

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen cyber-grid">
      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-neon-green)] opacity-5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[var(--color-neon-cyan)] opacity-5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[var(--color-neon-green)]/30 mb-8 animate-fade-in-up">
            <div className="pulse-dot" />
            <span className="text-sm text-[var(--color-neon-green)] font-mono">Live CTF Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up-delay-1">
            <span className="gradient-text-green-cyan">NetQuest</span>
            <span className="text-[var(--color-text-primary)]"> AI</span>
          </h1>

          <p className="text-xl sm:text-2xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up-delay-2">
            Master network engineering through AI-guided CTF challenges.
            Configure, attack, defend — and learn from every attempt.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-3">
            {isAuthenticated ? (
              <Link
                id="hero-go-dashboard-btn"
                to="/dashboard"
                className="px-8 py-4 rounded-xl text-lg font-semibold btn-neon-green inline-block"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  id="hero-get-started-btn"
                  to="/register"
                  className="px-8 py-4 rounded-xl text-lg font-semibold btn-neon-green inline-block"
                >
                  Start Learning Free →
                </Link>
                <Link
                  id="hero-login-btn"
                  to="/login"
                  className="px-8 py-4 rounded-xl text-lg font-semibold btn-neon-cyan inline-block"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Terminal preview card */}
        <div className="max-w-2xl mx-auto mt-20 animate-float">
          <div className="glass-card rounded-2xl overflow-hidden box-glow-cyan">
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
              <div className="w-3 h-3 rounded-full bg-[#f87171]" />
              <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
              <div className="w-3 h-3 rounded-full bg-[#00ff88]" />
              <span className="ml-3 text-xs text-[var(--color-text-muted)] font-mono">netquest-terminal</span>
            </div>
            <div className="p-6 font-mono text-sm space-y-2">
              <p><span className="text-[var(--color-neon-green)]">netquest</span><span className="text-[var(--color-text-muted)]">@ctf:~$</span> <span className="text-[var(--color-text-primary)]">connect challenge "BGP Hijack Defense"</span></p>
              <p className="text-[var(--color-neon-cyan)]">✓ Network topology loaded. 4 routers, 2 firewalls.</p>
              <p><span className="text-[var(--color-neon-green)]">netquest</span><span className="text-[var(--color-text-muted)]">@ctf:~$</span> <span className="text-[var(--color-text-primary)]">submit flag{"{"}<span className="text-[var(--color-neon-green)]">NQ{"{"}bgp_as_path_filter{"}"}</span>{"}"}</span></p>
              <p className="text-[var(--color-neon-green)]">🎯 CORRECT! +150 pts awarded. AI feedback generating...</p>
              <p className="text-[var(--color-neon-purple)]">🤖 AI: "Good use of AS-path filtering. Consider also implementing RPKI validation..."</p>
              <p className="text-[var(--color-text-muted)] animate-pulse">█</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to{' '}
              <span className="gradient-text-cyan-purple">master networking</span>
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto">
              Built for students, engineers, and security professionals who learn by doing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass-card rounded-2xl p-8 group hover:border-[var(--color-neon-cyan)]/50 transition-all duration-300 cursor-default"
                style={{ borderColor: 'rgba(26,58,92,0.8)' }}
              >
                <div
                  className="text-4xl mb-4 w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}40` }}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: f.color }}>{f.title}</h3>
                <p className="text-[var(--color-text-muted)] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto glass-card rounded-3xl p-12 text-center box-glow-green">
          <h2 className="text-4xl font-bold mb-4">
            Ready to <span className="gradient-text-green-cyan">hack the network?</span>
          </h2>
          <p className="text-[var(--color-text-muted)] mb-8 text-lg">
            Join thousands of learners already sharpening their network security skills.
          </p>
          <Link
            id="cta-register-btn"
            to="/register"
            className="px-10 py-4 rounded-xl text-lg font-semibold btn-neon-green inline-block"
          >
            Create Free Account →
          </Link>
        </div>
      </section>
    </div>
  )
}
