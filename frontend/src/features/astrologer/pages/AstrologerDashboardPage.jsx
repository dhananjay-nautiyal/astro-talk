import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { toggleAstrologerStatus, updateAstrologerProfile } from '../../../api/astrologerAPI'
import { getAdminDashboard } from '../../../api/adminAPI'
import { FiDollarSign, FiClock, FiStar, FiUsers, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const AstrologerDashboardPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(user?.online || false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    getAdminDashboard()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async () => {
    setToggling(true)
    try {
      await toggleAstrologerStatus()
      setIsOnline(!isOnline)
      toast.success(isOnline ? 'You are now offline' : 'You are now online')
    } catch {
      toast.error('Failed to toggle status')
    } finally {
      setToggling(false)
    }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />

  const statCards = [
    { icon: FiDollarSign, label: 'Total Earnings', value: `₹${stats?.totalEarnings?.toLocaleString() || '0'}`, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: FiClock, label: "Today's Consultations", value: stats?.todayConsultations || '0', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: FiStar, label: 'Rating', value: (stats?.rating || user?.rating || '5.0').toFixed(1), color: 'text-gold', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { icon: FiUsers, label: 'Total Clients', value: stats?.totalClients || '0', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ]

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-light">Astrologer Dashboard</h1>
          <p className="text-muted mt-1">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            isOnline ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-white/5 text-muted'
          }`}
        >
          {isOnline ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
          {isOnline ? 'Online' : 'Offline'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-cosmic-2 rounded-2xl p-5 border border-white/5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="text-xl font-bold text-light mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-cosmic-2 rounded-2xl p-6 border border-white/5">
        <h2 className="font-semibold text-light mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="p-4 bg-gold/10 rounded-xl text-left hover:bg-gold/10 transition-colors">
            <p className="text-sm font-medium text-gold">Edit Profile</p>
            <p className="text-xs text-muted mt-1">Update your bio and specializations</p>
          </button>
          <button className="p-4 bg-gold/5 rounded-xl text-left hover:bg-gold/10 transition-colors">
            <p className="text-sm font-medium text-gold-dark">View Earnings</p>
            <p className="text-xs text-muted mt-1">Check your earnings history</p>
          </button>
          <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-left hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <p className="text-sm font-medium text-green-600">Set Availability</p>
            <p className="text-xs text-muted mt-1">Manage your online hours</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AstrologerDashboardPage
