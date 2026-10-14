import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { getRevenueReport } from '../../../api/adminAPI'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

const AdminRevenuePage = () => {
  const [revenue, setRevenue] = useState([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('weekly')
  const [total, setTotal] = useState(0)

  const selectRange = (r) => {
    setLoading(true)
    setRange(r)
  }

  useEffect(() => {
    getRevenueReport({ range })
      .then(({ data }) => {
        setRevenue(data.chart || data || [])
        setTotal(data.total || 0)
      })
      .catch(() => toast.error('Failed to load revenue data.'))
      .finally(() => setLoading(false))
  }, [range])

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light">Revenue</h1>
          <p className="text-muted mt-1">Track platform earnings</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Total Revenue</p>
          <p className="text-2xl font-bold text-green-500">₹{total.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['daily', 'weekly', 'monthly', 'yearly'].map((r) => (
          <button key={r} onClick={() => selectRange(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              range === r ? 'bg-gold text-cosmic' : 'bg-white/5 text-muted hover:bg-white/10'
            }`}>
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" size="lg" />
      ) : (
        <div className="bg-cosmic-2 rounded-2xl p-6 border border-white/5">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
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
      )}
    </div>
  )
}

export default AdminRevenuePage
