import { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAstrologers, setLoading, setPage } from '../store/astrologerSlice'
import { getAstrologers } from '../../../api/astrologerAPI'
import AstrologerCard from '../components/AstrologerCard'
import AstrologerFilters from '../components/AstrologerFilters'
import Pagination from '../../../components/common/Pagination'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import { FiUsers, FiSliders } from 'react-icons/fi'

const AstrologerListPage = () => {
  const dispatch = useDispatch()
  const { list, filters, pagination, loading } = useSelector((state) => state.astrologer)
  const [showFilters, setShowFilters] = useState(false)

  const fetchAstrologers = useCallback(async () => {
    try {
      const params = {
        page: pagination.page - 1,
        size: 12,
        ...filters,
      }
      Object.keys(params).forEach((k) => {
        if (!params[k] && params[k] !== 0) delete params[k]
      })
      const { data } = await getAstrologers(params)
      dispatch(setAstrologers(data))
    } catch (err) {
      console.error('Failed to fetch astrologers:', err)
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch, filters, pagination.page])

  useEffect(() => {
    fetchAstrologers()
  }, [fetchAstrologers])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gold">Find Astrologers</h1>
          <p className="text-sm text-muted mt-1">{pagination.totalElements} experts available</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl text-sm font-medium text-muted hover:bg-white/5 transition-colors">
          <FiSliders /> Filters
        </button>
      </div>

      <div className="flex gap-8">
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
          <AstrologerFilters />
        </div>

        <div className="flex-1">
          {loading ? (
            <LoadingSpinner className="py-20" size="lg" />
          ) : list.length === 0 ? (
            <EmptyState icon={FiUsers} title="No astrologers found" description="Try adjusting your filters" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {list.map((astro) => (
                  <AstrologerCard key={astro.id} astrologer={astro} />
                ))}
              </div>
              <Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => { dispatch(setLoading(true)); dispatch(setPage(p)) }} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AstrologerListPage
