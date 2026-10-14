import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getWalletBalance } from '../../../api/walletAPI'
import { getConsultationHistory } from '../../../api/consultationAPI'
import { setBalance } from '../../../features/wallet/store/walletSlice'
import { FiCreditCard, FiClock, FiStar, FiArrowRight, FiMessageCircle, FiPhone } from 'react-icons/fi'
import WalletCard from '../../../features/wallet/components/WalletCard'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import dayjs from 'dayjs'

const DashboardPage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { balance } = useSelector((state) => state.wallet)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getWalletBalance().then(({ data }) => dispatch(setBalance(data.balance))).catch(() => toast.error('Failed to load wallet balance.')),
      getConsultationHistory({ page: 0, size: 5 }).then(({ data }) => setHistory(data.content || data || [])).catch(() => toast.error('Failed to load consultation history.')),
    ]).finally(() => setLoading(false))
  }, [dispatch])

  if (loading) return <LoadingSpinner className="py-20" size="lg" />

  return (
    <div className="page-transition">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light">Welcome, {user?.name}!</h1>
        <p className="text-muted">Here's your astrology journey</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/wallet" className="lg:col-span-1">
          <WalletCard balance={balance} />
        </Link>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: FiClock, label: 'Consultations', value: history.length, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { icon: FiStar, label: 'Favourites', value: '0', color: 'text-gold', bg: 'bg-amber-100 dark:bg-amber-900/30' },
              { icon: FiCreditCard, label: 'Total Spent', value: `₹${history.reduce((s, h) => s + (h.cost || 0), 0)}`, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
          ].map((stat, i) => (
            <div key={i} className="bg-cosmic-2 rounded-2xl p-5 border border-white/5">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <p className="text-xs text-muted">{stat.label}</p>
              <p className="text-lg font-bold text-light mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-cosmic-2 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-semibold text-light">Recent Consultations</h2>
          <Link to="/history" className="text-sm text-gold font-medium hover:underline flex items-center gap-1">
            View All <FiArrowRight size={14} />
          </Link>
        </div>
        {history.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={FiClock} title="No consultations yet" description="Start your first consultation with an expert astrologer" action={
              <Link to="/astrologers" className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-cosmic rounded-xl text-sm font-medium hover:opacity-90 transition-colors">
                Find Astrologers
              </Link>
            } />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {history.map((consultation) => (
              <Link key={consultation.id} to={`/consultation/${consultation.id}`} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  {consultation.type === 'call' ? <FiPhone className="text-gold" size={18} /> : <FiMessageCircle className="text-gold" size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-light truncate">{consultation.astrologerName}</p>
                  <p className="text-xs text-muted">{dayjs(consultation.startTime).format('MMM dd, yyyy HH:mm')}</p>
                </div>
                <span className="text-sm font-medium text-gold">₹{consultation.cost || 0}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
