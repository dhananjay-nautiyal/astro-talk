import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getCurrentUser, updateProfile } from '../../../api/authAPI'
import { updateUser } from '../store/authSlice'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiCamera } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [form, setForm] = useState({
    name: '', phone: '', dateOfBirth: '', placeOfBirth: '', gender: '', profilePicture: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCurrentUser()
      .then(({ data }) => {
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          placeOfBirth: data.placeOfBirth || '',
          gender: data.gender || '',
          profilePicture: data.profilePicture || '',
        })
      })
      .catch(() => toast.error('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await updateProfile(form)
      dispatch(updateUser(data))
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />

  return (
    <div className="max-w-2xl page-transition">
      <h1 className="text-2xl font-bold text-light mb-6">Profile</h1>

      <div className="bg-cosmic-2 rounded-2xl border border-white/5 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <img
              src={form.profilePicture || `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=6B21A8&color=fff&size=80`}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-light">{user?.name}</h2>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-light mb-1.5"><FiUser className="inline mr-1" size={14} /> Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light mb-1.5"><FiMail className="inline mr-1" size={14} /> Email</label>
              <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3/50 text-muted text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light mb-1.5"><FiPhone className="inline mr-1" size={14} /> Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light mb-1.5"><FiCalendar className="inline mr-1" size={14} /> Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light mb-1.5"><FiMapPin className="inline mr-1" size={14} /> Place of Birth</label>
              <input type="text" name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange} placeholder="e.g. Mumbai" className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-light mb-1.5">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30">
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-light mb-1.5"><FiCamera className="inline mr-1" size={14} /> Profile Picture URL</label>
            <input type="url" name="profilePicture" value={form.profilePicture} onChange={handleChange} placeholder="https://example.com/photo.jpg" className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30" />
          </div>

          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gold text-cosmic rounded-xl font-medium hover:opacity-90 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
