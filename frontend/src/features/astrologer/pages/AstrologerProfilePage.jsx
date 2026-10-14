import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAstrologerProfile } from '../../../api/astrologerAPI'
import { getReviewsByAstrologer } from '../../../api/reviewAPI'
import { startConsultation } from '../../../api/consultationAPI'
import { useSelector } from 'react-redux'
import ReviewCard from '../components/ReviewCard'
import Badge from '../../../components/common/Badge'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { FiMessageCircle, FiPhone, FiStar, FiGlobe, FiBookOpen, FiDollarSign, FiCheckCircle, FiAward } from 'react-icons/fi'
import toast from 'react-hot-toast'

const AstrologerProfilePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [astrologer, setAstrologer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAstrologerProfile(id),
      getReviewsByAstrologer(id, { page: 0, size: 10 }),
    ])
      .then(([profileRes, reviewsRes]) => {
        setAstrologer(profileRes.data)
        setReviews(reviewsRes.data.content || reviewsRes.data || [])
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [id])

  const typeMap = { chat: 'CHAT', call: 'VOICE', video: 'VIDEO' }

  const handleStartConsultation = async (type) => {
    if (!isAuthenticated) {
      toast.error('Please login to start a consultation')
      navigate('/login')
      return
    }
    try {
      const { data } = await startConsultation({ astrologerId: id, type: typeMap[type] || type })
      navigate(`/consultation/${data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start consultation')
    }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />
  if (!astrologer) return <div className="text-center py-20 text-muted">Astrologer not found</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-transition">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-cosmic-2 rounded-2xl p-8 border border-white/5">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <img
                src={astrologer.profilePhoto || `https://ui-avatars.com/api/?name=${astrologer.name}&background=6B21A8&color=fff&size=120`}
                alt={astrologer.name}
                className="w-28 h-28 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-light">{astrologer.name}</h1>
                    <p className="text-muted mt-1">{astrologer.specialization}</p>
                  </div>
                  <Badge status={astrologer.online ? 'online' : 'offline'} />
                </div>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <FiStar className="text-gold fill-gold" />
                    <span className="font-semibold text-light">{astrologer.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-sm text-muted">({astrologer.reviewCount || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted">
                    <FiDollarSign size={16} className="text-gold" />
                    <span className="font-semibold text-gold">₹{astrologer.pricePerMin || 10}/min</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted">
                    <FiCheckCircle size={16} className="text-green-500" />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-semibold text-light mb-2">About</h3>
                  <p className="text-sm text-muted leading-relaxed">{astrologer.bio || 'Experienced astrologer with deep knowledge of Vedic astrology, numerology, and tarot reading.'}</p>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {astrologer.specializations?.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-gold/10 text-gold rounded-lg text-xs font-medium">{s}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button onClick={() => handleStartConsultation('chat')} className="flex items-center gap-2 px-6 py-2.5 bg-gold text-cosmic rounded-xl font-medium hover:opacity-90 transition-colors">
                    <FiMessageCircle size={18} /> Chat Now
                  </button>
                  <button onClick={() => handleStartConsultation('call')} className="flex items-center gap-2 px-6 py-2.5 bg-gold text-cosmic rounded-xl font-medium hover:bg-gold-dark transition-colors">
                    <FiPhone size={18} /> Call Now
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
              {[
                { icon: FiAward, label: 'Experience', value: `${astrologer.experience || 5}+ years` },
                { icon: FiBookOpen, label: 'Consultations', value: `${astrologer.totalConsultations || 0}+` },
                { icon: FiGlobe, label: 'Languages', value: astrologer.languages?.join(', ') || 'Hindi, English' },
                { icon: FiStar, label: 'Rating', value: `${astrologer.rating?.toFixed(1) || '5.0'}/5` },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 bg-cosmic-3 rounded-xl">
                  <stat.icon className="mx-auto text-gold mb-2" size={22} />
                  <p className="text-xs text-muted">{stat.label}</p>
                  <p className="text-sm font-semibold text-light">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-cosmic-2 rounded-2xl p-8 border border-white/5">
            <h2 className="text-xl font-bold text-light mb-6">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-muted text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-cosmic-2 rounded-2xl p-6 border border-white/5 sticky top-24">
            <h3 className="font-semibold text-light mb-4">Book Consultation</h3>
            <div className="space-y-3">
              <button onClick={() => handleStartConsultation('chat')} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold text-cosmic rounded-xl font-medium hover:opacity-90 transition-colors">
                <FiMessageCircle /> Start Chat
              </button>
              <button onClick={() => handleStartConsultation('call')} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold text-cosmic rounded-xl font-medium hover:bg-gold-dark transition-colors">
                <FiPhone /> Start Call
              </button>
            </div>
            <p className="text-xs text-muted text-center mt-4">You will be charged ₹{astrologer.pricePerMin || 10}/minute</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AstrologerProfilePage
