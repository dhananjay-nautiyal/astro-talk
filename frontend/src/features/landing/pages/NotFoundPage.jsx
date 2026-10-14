import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
    <p className="text-6xl font-bold text-gold">404</p>
    <h1 className="text-xl font-semibold text-light">Page not found</h1>
    <p className="text-muted">The page you are looking for does not exist.</p>
    <Link to="/" className="px-4 py-2 bg-gold text-cosmic rounded-xl text-sm font-medium">
      Go home
    </Link>
  </div>
)

export default NotFoundPage
