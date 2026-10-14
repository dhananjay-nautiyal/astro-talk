import { Component } from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[astro-talk] uncaught render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center" role="alert">
          <h1 className="text-2xl font-bold text-light">Something went wrong</h1>
          <p className="text-muted">Please refresh the page or go back home.</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gold text-cosmic rounded-xl text-sm font-medium"
            >
              Refresh
            </button>
            <Link to="/" className="px-4 py-2 border border-white/10 rounded-xl text-sm font-medium text-light">
              Go home
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
