import { memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setFilters, setLoading, resetFilters } from '../store/astrologerSlice'
import { FiSearch } from 'react-icons/fi'

const specializations = ['Vedic', 'Numerology', 'Palmistry', 'Tarot', 'Vastu', 'Astrology', 'Face Reading']
const languages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati']

const AstrologerFilters = memo(() => {
  const dispatch = useDispatch()
  const filters = useSelector((state) => state.astrologer.filters)

  const handleFilterChange = (key, value) => {
    dispatch(setLoading(true))
    dispatch(setFilters({ [key]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-light">Filters</h3>
        <button
          onClick={() => { dispatch(setLoading(true)); dispatch(resetFilters()) }}
          className="text-xs text-gold hover:underline"
        >
          Reset All
        </button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search astrologers..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-2">Specialization</label>
        <div className="flex flex-wrap gap-2">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => handleFilterChange('specialization', filters.specialization === spec ? '' : spec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.specialization === spec
                  ? 'bg-gold text-cosmic'
                  : 'bg-white/5 text-muted hover:bg-white/10'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-2">Language</label>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleFilterChange('language', filters.language === lang ? '' : lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.language === lang
                  ? 'bg-gold text-cosmic'
                  : 'bg-white/5 text-muted hover:bg-white/10'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Price Range: ₹{filters.minPrice} - ₹{filters.maxPrice}
        </label>
        <input
          type="range"
          min="0"
          max="1000"
          step="10"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
          className="w-full accent-gold"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>₹0</span>
          <span>₹1000</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-muted mb-2">
          Minimum Rating: {filters.rating}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={filters.rating}
          onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
          className="w-full accent-gold"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>0</span>
          <span>5</span>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.onlineOnly}
          onChange={(e) => handleFilterChange('onlineOnly', e.target.checked)}
          className="w-4 h-4 rounded accent-gold"
        />
        <span className="text-sm font-medium text-muted">Online Only</span>
      </label>
    </div>
  )
})

export default AstrologerFilters
