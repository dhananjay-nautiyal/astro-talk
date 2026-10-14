import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { getAdminDashboard } from '../../../api/adminAPI'
import { FiUsers, FiStar, FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboard()
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner className="py-20" size="lg" />

  const statCards = [
    { icon: FiUsers, label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || '0', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { icon: FiStar, label: 'Total Astrologers', value: stats?.totalAstrologers?.toLocaleString() || '0', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { icon: FiDollarSign, label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    { icon: FiTrendingUp, label: 'Active Consultations', value: stats?.activeConsultations || '0', color: 'text-gold', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ]

  const chartData = stats?.revenueChart || [
    { name: 'Mon', revenue: 0 }, { name: 'Tue', revenue: 0 }, { name: 'Wed', revenue: 0 },
    { name: 'Thu', revenue: 0 }, { name: 'Fri', revenue: 0 }, { name: 'Sat', revenue: 0 }, { name: 'Sun', revenue: 0 },
  ]

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold text-light mb-6">Admin Dashboard</h1>

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
        <h2 className="font-semibold text-light mb-6">Revenue (This Week)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                labelStyle={{ color: '#111827' }}
              />
              <Bar dataKey="revenue" fill="#6B21A8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
