import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice'
import { loginUser } from '../../api/authAPI'
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi'
import { useLanguage } from '../../context/LanguageContext'
import toast from 'react-hot-toast'

const getErrorMessage = (err, t) => {
  if (!err.response) return t.serverError
  const { status } = err.response
  if (status === 400) return t.emailRequired
  if (status === 401) return t.wrongPassword
  if (status === 404) return t.emailNotFound
  return t.serverError
}

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)
  const { t } = useLanguage()

  if (!open) return null

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error(t.emailRequired)
      return
    }
    dispatch(loginStart())
    try {
      const { data } = await loginUser({ email, password })
      dispatch(loginSuccess(data))
      toast.success(`Welcome back, ${data.name}!`)
      onClose()
    } catch (err) {
      const msg = getErrorMessage(err, t.auth || t)
      dispatch(loginFailure(msg))
      toast.error(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-card relative w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
          <FiX size={20} />
        </button>

        <div className="text-center mb-6">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)', letterSpacing: '.12em' }}>AstroTalk</div>
          <h2 className="text-xl font-bold text-[var(--cream)]" style={{ fontFamily: 'var(--font-display)', fontWeight: 400, marginTop: '.5rem' }}>
            {t.auth?.welcomeBack || 'Welcome Back'}
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1" style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
            {t.auth?.signInTo || 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email" placeholder={t.auth?.email || 'Email'} value={email}
            onChange={(e) => setEmail(e.target.value)} required
            className="r-input w-full rounded-xl"
          />
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} placeholder={t.auth?.password || 'Password'}
              value={password} onChange={(e) => setPassword(e.target.value)} required
              className="r-input w-full rounded-xl pr-10"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full !text-[.65rem] !py-3">
            {loading ? 'Signing in...' : (t.auth?.signIn || 'Sign In')}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted)' }}>
          {t.auth?.noAccount || "Don't have an account?"}{' '}
          <Link to="/register" onClick={onClose} style={{ color: 'var(--gold)' }} className="font-medium hover:underline">
            {t.auth?.register || 'Register'}
          </Link>
        </p>
      </div>
    </div>
  )
}
