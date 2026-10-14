import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { getTransactions } from '../../../api/walletAPI'
import { FiDollarSign, FiArrowUpRight } from 'react-icons/fi'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import Pagination from '../../../components/common/Pagination'
import dayjs from 'dayjs'

const EarningsPage = () => {
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const totalEarned = earnings.reduce((sum, e) => sum + (e.amount > 0 ? e.amount : 0), 0)

  useEffect(() => {
    getTransactions({ page: page - 1, size: 10, type: 'CREDIT' })
      .then(({ data }) => {
        setEarnings(data.content || data || [])
        setTotalPages(data.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load earnings.'))
      .finally(() => setLoading(false))
  }, [page])

  if (loading) return <LoadingSpinner className="py-20" size="lg" />

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light">Earnings</h1>
          <p className="text-muted mt-1">Your consultation earnings</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Total Earned</p>
          <p className="text-2xl font-bold text-green-500">₹{totalEarned.toLocaleString()}</p>
        </div>
      </div>

      {earnings.length === 0 ? (
        <EmptyState icon={FiDollarSign} title="No earnings yet" description="Start taking consultations to earn" />
      ) : (
        <div className="bg-cosmic-2 rounded-2xl border border-white/5 divide-y divide-white/5">
          {earnings.map((e) => (
            <div key={e.id} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FiArrowUpRight className="text-green-500" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light">{e.description}</p>
                <p className="text-xs text-muted">{dayjs(e.createdAt).format('MMM dd, yyyy HH:mm')}</p>
              </div>
              <span className="text-sm font-semibold text-green-500">+₹{Math.abs(e.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

export default EarningsPage
