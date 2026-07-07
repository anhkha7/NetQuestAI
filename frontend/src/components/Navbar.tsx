import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logo}
            alt="NetQuest AI"
            className="h-9 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
          />
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="hover:text-[var(--color-neon-cyan)] transition-colors duration-200">
                Dashboard
              </Link>
              <Link to="/challenges" className="hover:text-[var(--color-neon-cyan)] transition-colors duration-200">
                Challenges
              </Link>
            </>
          )}
        </div>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-[var(--color-text-muted)]">{user?.username}</span>
                <span className="text-[var(--color-neon-green)] font-mono font-bold">
                  {user?.totalPoints} pts
                </span>
              </div>
              <button
                id="navbar-logout-btn"
                onClick={handleLogout}
                className="px-4 py-1.5 text-sm rounded-lg btn-neon-cyan font-medium cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                id="navbar-login-link"
                to="/login"
                className="px-4 py-1.5 text-sm rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                id="navbar-register-link"
                to="/register"
                className="px-4 py-1.5 text-sm rounded-lg btn-neon-green font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
