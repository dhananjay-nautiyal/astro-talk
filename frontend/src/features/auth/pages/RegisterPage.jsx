import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginSuccess } from '../store/authSlice'
import { registerUser, registerAstrologer } from '../../../api/authAPI'
import { FiStar, FiEye, FiEyeOff, FiUser, FiStar as FiStarIcon } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { normalizeEmail, isValidEmail } from '../../../utils/validation'

const roleOptions = [
  { value: 'USER', label: "I'm a User", desc: 'Browse astrologers, book sessions, get guidance', icon: FiUser },
  { value: 'ASTROLOGER', label: "I'm an Astrologer", desc: 'Offer consultations, manage profile, earn', icon: FiStarIcon },
]

const RegisterPage = () => {
  const [role, setRole] = useState('USER')
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    bio: '', specialization: '', yearsOfExperience: '', languages: '', consultationFee: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector((state) => state.auth)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = normalizeEmail(form.email)
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address (e.g. name@example.com).')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      let data
      if (role === 'ASTROLOGER') {
        const res = await registerAstrologer({
          name: form.name,
          email,
          password: form.password,
          phone: form.phone,
          bio: form.bio,
          specialization: form.specialization,
          yearsOfExperience: Number(form.yearsOfExperience) || 0,
          languages: form.languages,
          consultationFee: Number(form.consultationFee) || 0,
        })
        data = res.data
      } else {
        const res = await registerUser({
          name: form.name,
          email,
          password: form.password,
          phone: form.phone,
        })
        data = res.data
      }
      dispatch(loginSuccess(data))
      toast.success('Registration successful!')
      const dest = role === 'ASTROLOGER' ? '/astrologer/dashboard' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const isAstrologer = role === 'ASTROLOGER'

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-2xl mb-4">
            <FiStar className="text-cosmic" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gold">Create Account</h1>
          <p className="text-muted mt-1">Join AstroTalk today</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {roleOptions.map((opt) => {
            const selected = role === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? 'border-gold bg-gold/10'
                    : 'border-white/10 bg-cosmic-2 hover:border-white/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-gold text-cosmic' : 'bg-cosmic-3 text-muted'}`}>
                  <opt.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${selected ? 'text-gold' : 'text-light'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{opt.desc}</p>
                </div>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="bg-cosmic-2 rounded-2xl p-8 border border-white/5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-light mb-1.5">Full Name</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange}
              placeholder="John Doe" required
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light mb-1.5">Email</label>
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="you@example.com" required
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light mb-1.5">Phone</label>
            <input
              type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
            />
          </div>

          {isAstrologer && (
            <>
              <div className="border-t border-white/10 pt-4">
                <p className="text-sm font-semibold text-light mb-3">Astrologer Details</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-light mb-1.5">Bio</label>
                <textarea
                  name="bio" value={form.bio} onChange={handleChange} rows={3}
                  placeholder="Tell users about yourself, your experience, and approach..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-1.5">Specialization</label>
                  <input
                    type="text" name="specialization" value={form.specialization} onChange={handleChange}
                    placeholder="e.g. Vedic, Tarot"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light mb-1.5">Years of Experience</label>
                  <input
                    type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange}
                    placeholder="5" min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-light mb-1.5">Languages</label>
                  <input
                    type="text" name="languages" value={form.languages} onChange={handleChange}
                    placeholder="Hindi, English"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-light mb-1.5">Consultation Fee (₹)</label>
                  <input
                    type="number" name="consultationFee" value={form.consultationFee} onChange={handleChange}
                    placeholder="100" min="0" step="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-light mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                placeholder="Min. 6 characters" required minLength={6}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <FiEyeOff className="text-muted" size={18} /> : <FiEye className="text-muted" size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-light mb-1.5">Confirm Password</label>
            <input
              type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
              placeholder="Re-enter password" required
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-gold to-gold-dark text-cosmic rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Creating account...' : isAstrologer ? 'Register as Astrologer' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-muted">
            Already have an account? <Link to="/login" className="text-gold font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
