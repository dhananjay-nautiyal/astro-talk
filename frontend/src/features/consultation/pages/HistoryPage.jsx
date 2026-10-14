import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getConsultationHistory } from '../../../api/consultationAPI'
import Pagination from '../../../components/common/Pagination'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import { FiClock, FiMessageCircle, FiPhone, FiVideo } from 'react-icons/fi'
import dayjs from 'dayjs'

const HistoryPage = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const params = { page: page - 1, size: 10 }
    if (filter !== 'all') params.type = filter
    getConsultationHistory(params)
      .then(({ data }) => {
        setHistory(data.content || data || [])
        setTotalPages(data.totalPages || 1)
      })
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false))
  }, [page, filter])

  const typeIcons = { chat: FiMessageCircle, call: FiPhone, video: FiVideo }

  return (
    <div className="page-transition">
      <h1 className="text-2xl font-bold text-light mb-6">Consultation History</h1>

      <div className="flex gap-2 mb-6">
        {['all', 'chat', 'call', 'video'].map((t) => (
          <button
            key={t}
            onClick={() => { setLoading(true); setFilter(t); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === t
                ? 'bg-gold text-cosmic'
                : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" size="lg" />
      ) : history.length === 0 ? (
        <EmptyState icon={FiClock} title="No consultations found" description="Your consultation history will appear here" />
      ) : (
        <div className="bg-cosmic-2 rounded-2xl border border-white/5 divide-y divide-white/5">
          {history.map((c) => {
            const Icon = typeIcons[c.type] || FiMessageCircle
            return (
              <Link key={c.id} to={`/consultation/${c.id}`} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <Icon className="text-gold" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-light truncate">{c.astrologerName}</p>
                  <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                    <span>{dayjs(c.startTime).format('MMM dd, yyyy HH:mm')}</span>
                    <span>•</span>
                    <span className="capitalize">{c.type}</span>
                    <span>•</span>
                    <span>{c.duration ? `${Math.floor(c.duration / 60)}m` : '-'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gold">₹{c.cost || 0}</p>
                  <p className={`text-xs ${c.status === 'completed' ? 'text-green-500' : 'text-muted'}`}>{c.status}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setLoading(true); setPage(p) }} />
    </div>
  )
}

export default HistoryPage
