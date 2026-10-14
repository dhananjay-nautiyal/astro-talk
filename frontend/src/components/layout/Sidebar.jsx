import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiHome, FiUser, FiClock, FiCreditCard, FiStar, FiBarChart2, FiUsers, FiDollarSign, FiEdit3 } from 'react-icons/fi'

const userLinks = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/wallet', icon: FiCreditCard, label: 'Wallet' },
  { to: '/history', icon: FiClock, label: 'History' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
]

const astrologerLinks = [
  { to: '/astrologer/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/astrologer/profile', icon: FiEdit3, label: 'Edit Profile' },
  { to: '/astrologer/earnings', icon: FiDollarSign, label: 'Earnings' },
]

const adminLinks = [
  { to: '/admin/dashboard', icon: FiBarChart2, label: 'Dashboard' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/astrologers', icon: FiStar, label: 'Astrologers' },
  { to: '/admin/revenue', icon: FiDollarSign, label: 'Revenue' },
]

const Sidebar = () => {
  const { role } = useSelector((state) => state.auth)
  const links = role === 'ASTROLOGER' ? astrologerLinks : role === 'ADMIN' ? adminLinks : userLinks

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20 bg-cosmic-2 rounded-2xl border border-white/5 p-4">
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-muted hover:bg-white/5 hover:text-light'
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
