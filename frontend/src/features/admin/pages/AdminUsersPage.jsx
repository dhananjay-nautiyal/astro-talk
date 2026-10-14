import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { getUsers } from '../../../api/adminAPI'
import Pagination from '../../../components/common/Pagination'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import EmptyState from '../../../components/common/EmptyState'
import { FiUsers, FiSearch } from 'react-icons/fi'

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  const changePage = (p) => {
    setLoading(true)
    setPage(p)
  }

  useEffect(() => {
    getUsers({ page: page - 1, size: 10, search })
      .then(({ data }) => {
        setUsers(data.content || data || [])
        setTotalPages(data.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false))
  }, [page, search])

  return (
    <div className="page-transition">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-light">Users</h1>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text" placeholder="Search users..."
            value={search} onChange={(e) => { setLoading(true); setSearch(e.target.value); setPage(1) }}
            className="pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 w-64"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" size="lg" />
      ) : users.length === 0 ? (
        <EmptyState icon={FiUsers} title="No users found" />
      ) : (
        <div className="bg-cosmic-2 rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-sm font-medium text-muted">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-muted">Role</th>
                <th className="text-left p-4 text-sm font-medium text-muted">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={u.profilePhoto || `https://ui-avatars.com/api/?name=${u.name}&background=6B21A8&color=fff&size=32`} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-sm font-medium text-light">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted">{u.email}</td>
                  <td className="p-4 text-sm text-muted">{u.phone || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${
                      u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : u.role === 'astro' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={changePage} />
    </div>
  )
}

export default AdminUsersPage
