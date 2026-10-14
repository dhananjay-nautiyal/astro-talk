import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice'
import { loginUser } from '../../../api/authAPI'
import { FiStar, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { normalizeEmail, isValidEmail } from '../../../utils/validation'

const getErrorMessage = (err) => {
  if (!err.response) return 'Something went wrong. Please try again later.'
  const { status, data } = err.response
  if (status === 400) {
    if (data?.message?.toLowerCase().includes('email')) return 'Email and password are required.'
    return data?.message || 'Email and password are required.'
  }
  if (status === 401) return 'Incorrect password. Please try again.'
  if (status === 404) return 'No account found with this email.'
  if (status >= 500) return 'Something went wrong. Please try again later.'
  return data?.message || 'Something went wrong. Please try again later.'
}

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading } = useSelector((state) => state.auth)
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required.')
      return
    }
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      toast.error('Please enter a valid email address.')
      return
    }

    dispatch(loginStart())
    try {
      const { data } = await loginUser({ email: normalizedEmail, password })
      dispatch(loginSuccess(data))
      toast.success(`Welcome back, ${data.name}!`)
      const roleDashboard = data.role === 'ASTROLOGER' ? '/astrologer/dashboard' : data.role === 'ADMIN' ? '/admin/dashboard' : from
      navigate(roleDashboard, { replace: true })
    } catch (err) {
      const msg = getErrorMessage(err)
      dispatch(loginFailure(msg))
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-2xl mb-4">
            <FiStar className="text-cosmic" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gold">Welcome Back</h1>
          <p className="text-muted mt-1">Sign in to continue to AstroTalk</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-cosmic-2/60 backdrop-blur-xl rounded-2xl p-8 border border-white/5 shadow-xl shadow-black/20 space-y-5">
          <div>
            <label className="block text-sm font-medium text-light mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/30 placeholder:text-muted transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-white/10 bg-white/5 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/30 placeholder:text-muted transition-colors"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <FiEyeOff className="text-muted" size={18} /> : <FiEye className="text-muted" size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-gold to-gold-dark text-cosmic rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-muted">
            Don&apos;t have an account? <Link to="/register" className="text-gold font-medium hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
