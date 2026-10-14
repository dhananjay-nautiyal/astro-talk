import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import { logoutUser } from '../../api/authAPI'
import { FiMenu, FiX, FiChevronDown, FiUser, FiLogOut } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'
import LoginModal from './LoginModal'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
]

const navLinks = [
  { label: 'Consultations', href: '/astrologers' },
  { label: 'Horoscope', href: '#' },
  { label: 'Free Services', href: '#' },
  { label: 'Calculators', href: '#' },
  { label: 'Panchang', href: '#' },
  { label: 'Shop', href: '#' },
  { label: 'Blog', href: '#' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const { isAuthenticated, user, role } = useSelector((state) => state.auth)
  const { lang, t, switchLang } = useLanguage()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const dashboardLink = role === 'ASTROLOGER' ? '/astrologer/dashboard'
    : role === 'ADMIN' ? '/admin/dashboard'
    : '/dashboard'

  const profileLink = role === 'ASTROLOGER' ? '/astrologer/profile'
    : role === 'ADMIN' ? '/admin/dashboard'
    : '/profile'

  const currentLang = languages.find((l) => l.code === lang) || languages[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // logout endpoint is best-effort; local logout below always runs
    }
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <>
      <nav className="glass sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[70px]">
          <Link to="/" className="nav-brand" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold)', letterSpacing: '0.12em' }}>
            AstroTalk
          </Link>

          <ul className="hidden lg:flex items-center gap-10 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  style={{ fontSize: '.7rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)' }}
                  className="hover:text-[var(--gold)] transition-colors"
                >
                  {t.nav?.[link.label.toLowerCase().replace(/\s+/g, '')] || link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-[.2em] uppercase text-[var(--muted)] border border-[rgba(201,168,76,0.2)] rounded hover:border-[rgba(201,168,76,0.4)] transition-colors"
              >
                {currentLang.label} <FiChevronDown size={12} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-[var(--dark2)] border border-[rgba(201,168,76,0.15)] rounded py-1 z-20 min-w-[130px] shadow-xl">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { switchLang(l.code); setLangOpen(false) }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                          lang === l.code ? 'text-[var(--gold)] bg-[rgba(201,168,76,0.1)]' : 'text-[var(--muted)] hover:bg-[rgba(255,255,255,0.03)]'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cosmic-3 border border-white/10 hover:border-gold/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                    <span className="text-cosmic text-xs font-bold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <span className="text-sm text-light font-medium max-w-[120px] truncate">{user.name}</span>
                  <FiChevronDown size={14} className={`text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-cosmic-2 border border-white/10 rounded-xl py-2 min-w-[180px] shadow-xl z-50">
                    <Link
                      to={profileLink}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-light hover:bg-white/5 transition-colors"
                    >
                      <FiUser size={16} />
                      Profile
                    </Link>
                    <Link
                      to={dashboardLink}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-light hover:bg-white/5 transition-colors"
                    >
                      {t.nav?.dashboard || 'Dashboard'}
                    </Link>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <FiLogOut size={16} />
                      {t.nav?.logout || 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-medium tracking-[.2em] uppercase text-[var(--muted)] border border-[rgba(201,168,76,0.2)] rounded hover:border-[rgba(201,168,76,0.4)] transition-colors"
                >
                  Log In
                </Link>
                <button onClick={() => setLoginOpen(true)} className="btn-gold !px-5 !py-2.5 !text-[.65rem]">
                  {t.nav?.signIn || 'Sign In'}
                </button>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/5 bg-cosmic-2 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                style={{ fontSize: '.7rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)' }}
                className="block px-3 py-2.5 hover:text-[var(--gold)] transition-colors"
              >
                {t.nav?.[link.label.toLowerCase().replace(/\s+/g, '')] || link.label}
              </Link>
            ))}
            <div className="border-t border-[rgba(201,168,76,0.1)] pt-3 mt-3 flex gap-2 px-3">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { switchLang(l.code); setMobileOpen(false) }}
                  className={`px-3 py-1.5 text-xs font-medium tracking-[.2em] uppercase rounded transition-colors ${
                    lang === l.code ? 'text-[var(--gold)] bg-[rgba(201,168,76,0.1)]' : 'text-[var(--muted)]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
