import toast from 'react-hot-toast'
import { useState, useEffect, useRef, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FiStar, FiArrowRight } from 'react-icons/fi'
import { getTopAstrologers } from '../../../api/astrologerAPI'
import AstrologerCard from '../../../features/astrologer/components/AstrologerCard'
import TickerBar from '../../../components/layout/TickerBar'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { useLanguage } from '../../../context/LanguageContext'
import { useIsInstalled } from '../../../hooks/useIsInstalled'
import { appDownloadUrl } from '../../../utils/env'
import LoginModal from '../../../components/layout/LoginModal'
import HeroScene from '../components/HeroScene'

const avatars = [
  'https://i.pravatar.cc/40?u=1', 'https://i.pravatar.cc/40?u=2',
  'https://i.pravatar.cc/40?u=3', 'https://i.pravatar.cc/40?u=4',
  'https://i.pravatar.cc/40?u=5',
]

const astroSpecials = [
  { tag: 'Vedic', name: 'Vedic Astrology Reading', desc: 'Ancient wisdom for modern life — detailed birth chart analysis with personalized remedies.', price: '₹ 299' },
  { tag: 'Tarot', name: 'Tarot Card Session', desc: 'Uncover what lies ahead with a professional tarot reading tailored to your questions.', price: '₹ 199' },
  { tag: 'Numerology', name: 'Numerology Report', desc: 'Discover the power of your numbers — life path, destiny, and name analysis.', price: '₹ 249' },
  { tag: 'Palmistry', name: 'Palm Reading', desc: 'The lines on your hand tell a story. Let an expert decode yours.', price: '₹ 349' },
  { tag: 'Love', name: 'Love & Relationship', desc: 'Get clarity on your relationships with compassionate, expert guidance.', price: '₹ 399' },
  { tag: 'Career', name: 'Career Consultation', desc: 'Navigate your professional path with astrological insights and timing.', price: '₹ 299' },
]

const HomePage = () => {
  const { t, lang } = useLanguage()
  const installed = useIsInstalled()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [topAstrologers, setTopAstrologers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loginOpen, setLoginOpen] = useState(false)
  const fadeRefs = useRef([])

  useEffect(() => {
    getTopAstrologers()
      .then(({ data }) => setTopAstrologers(data.content || data || []))
      .catch(() => toast.error('Failed to load astrologers.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08 }
    )
    fadeRefs.current.forEach((el) => { if (el) io.observe(el) })
    return () => io.disconnect()
  }, [topAstrologers])

  const addFadeRef = (el) => { if (el && !fadeRefs.current.includes(el)) fadeRefs.current.push(el) }

  const handleFreeChat = () => {
    if (!isAuthenticated) setLoginOpen(true)
    else navigate('/astrologers')
  }

  return (
    <div>
      <section className="hero-section">
        <div className="hero-bg" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=80)' }} />
        <div className="hero-overlay" />
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        <div className="hero-content relative z-[2] max-w-3xl px-8">
          <div className="hero-tag">
            {lang === 'hi' ? '48,726+ ज्योतिषी · 13 भाषाएं' : '48,726+ Astrologers · 13 Languages'}
          </div>
          <h1 className="hero-h1">
            {t.hero?.heading || 'Talk to'}<br />
            <em>{t.hero?.subheading || 'Astrologers right now.'}</em>
          </h1>
          <p className="hero-sub" style={{ margin: '1.2rem 0 2.5rem' }}>
            {t.hero?.description || 'Get personalized astrological guidance from verified experts.'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={handleFreeChat} className="btn-gold">
              {t.hero?.getFreeChat || 'Get Free Chat'}
            </button>
            {!installed && (
            <a className="btn-ghost" href={appDownloadUrl} target="_blank" rel="noopener noreferrer">
              {t.hero?.downloadApp || 'Download The App'}
            </a>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '2.5rem' }}>
            <div style={{ display: 'flex' }}>
              {avatars.map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--dark)', marginLeft: i === 0 ? 0 : -8 }} />
              ))}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 1 }}>
                {[...Array(5)].map((_, i) => (<FiStar key={i} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} size={12} />))}
              </div>
              <p style={{ fontSize: '.7rem', letterSpacing: '.1em', color: 'var(--muted)', marginTop: 2 }}>
                {lang === 'hi' ? 'उत्कृष्ट · 10,000+ समीक्षाएं' : 'Excellent · 10,000+ Reviews'}
              </p>
            </div>
          </div>
        </div>
        <div className="scroll-hint">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      <TickerBar />

      <div className="divider-full" style={{ padding: '3rem 6%' }}>
        <div className="div-line" />
        <div className="div-dia" />
        <div className="div-line" />
      </div>

      <section className="section-wrap" ref={addFadeRef}>
        <div className="eyebrow">{lang === 'hi' ? 'हमारी कहानी' : 'Our Story'}</div>
        <h2 className="sec-title" style={{ marginBottom: '1.4rem' }}>
          {lang === 'hi' ? 'ज्योतिष को सबके लिए<br><em>सुलभ</em> बनाना' : 'Making Astrology<br>Accessible for <em>Everyone</em>'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="max-md:grid-cols-1">
          <div>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
              alt="Astrologer"
              style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div>
            <p className="sec-body">
              {lang === 'hi'
                ? 'AstroTalk की शुरुआत एक सरल विचार से हुई — कि सटीक ज्योतिषीय मार्गदर्शन सभी के लिए उपलब्ध होना चाहिए, चाहे वे कहीं भी हों।'
                : 'AstroTalk began with a simple idea — that accurate astrological guidance should be available to everyone, wherever they are.'}
            </p>
            <p className="sec-body" style={{ marginTop: '1.2rem' }}>
              {lang === 'hi'
                ? 'आज हम 48,000+ सत्यापित ज्योतिषियों को 13 भाषाओं में सेवा प्रदान करने वाले लाखों उपयोगकर्ताओं से जोड़ते हैं।'
                : 'Today we connect millions of users with 48,000+ verified astrologers serving in 13 languages.'}
            </p>
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(201,168,76,0.12)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--dark3)', border: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--gold)', flexShrink: 0 }}>
                Aryan Rathi
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '.95rem', color: 'var(--cream)' }}>Aryan Rathi</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '.88rem', fontStyle: 'italic', color: 'var(--muted)' }}>{lang === 'hi' ? 'संस्थापक' : 'Founder'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider-full" style={{ padding: '0 6%' }}>
        <div className="div-line" /><div className="div-dia" /><div className="div-line" />
      </div>

      <section style={{ background: 'var(--dark2)', padding: '5rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={{ marginBottom: '3rem' }} ref={addFadeRef}>
            <div className="eyebrow eyebrow-center" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
              {lang === 'hi' ? 'विशेष सेवाएं' : 'Featured Services'}
            </div>
            <h2 className="sec-title">{lang === 'hi' ? 'हमारी <em>विशेषताएं</em>' : 'Our <em>Specialties</em>'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(201,168,76,0.1)' }} className="max-md:grid-cols-1" ref={addFadeRef}>
            {astroSpecials.map((item, i) => (
              <div key={i} className="astro-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
                <div style={{ padding: '1.4rem 1.6rem' }}>
                  <div style={{ fontSize: '.58rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '.5rem' }}>{item.tag}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--cream)', marginBottom: '.5rem' }}>{item.name}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '.95rem', fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', marginTop: '.8rem' }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-full" style={{ padding: '0 6%' }}>
        <div className="div-line" /><div className="div-dia" /><div className="div-line" />
      </div>

      <section className="section-wrap" ref={addFadeRef}>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="eyebrow">{lang === 'hi' ? 'शीर्ष ज्योतिषी' : 'Top Astrologers'}</div>
            <h2 className="sec-title" style={{ marginTop: '.5rem' }}>
              {lang === 'hi' ? 'हमारे <em>विशेषज्ञ</em>' : 'Our <em>Experts</em>'}
            </h2>
          </div>
          <Link to="/astrologers" className="btn-ghost !text-[.6rem] !px-4 !py-2">
            {lang === 'hi' ? 'सभी देखें' : 'View All'} <FiArrowRight size={12} style={{ marginLeft: 4 }} />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : topAstrologers.length === 0 ? (
          <p className="text-center py-12" style={{ color: 'var(--muted)' }}>
            {lang === 'hi' ? 'अभी तक कोई ज्योतिषी उपलब्ध नहीं है।' : 'No astrologers available yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topAstrologers.slice(0, 6).map((astro) => (
              <AstrologerCard key={astro.id} astrologer={astro} />
            ))}
          </div>
        )}
      </section>

      <div className="divider-full" style={{ padding: '0 6% 3rem' }}>
        <div className="div-line" /><div className="div-dia" /><div className="div-line" />
      </div>

      <section className="info-strip">
        <div className="max-w-7xl mx-auto" style={{ display: 'flex', flexWrap: 'wrap' }}>
          {[
            { label: lang === 'hi' ? 'ज्योतिषी' : 'Astrologers', value: '48,726+' },
            { label: lang === 'hi' ? 'भाषाएं' : 'Languages', value: '13' },
            { label: lang === 'hi' ? 'ग्राहक' : 'Customers', value: '120.2M+' },
            { label: lang === 'hi' ? 'सहायता' : 'Support', value: '24/7' },
          ].map((item, i) => (
            <div key={i} className="info-col">
              <div className="info-lbl">{item.label}</div>
              <div className="info-val" style={{ marginTop: '.3rem' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-full" style={{ padding: '3rem 6%' }}>
        <div className="div-line" /><div className="div-dia" /><div className="div-line" />
      </div>

      <section style={{ background: 'var(--dark2)', padding: '5rem 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={{ marginBottom: '3rem' }} ref={addFadeRef}>
            <div className="eyebrow eyebrow-center" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
              {lang === 'hi' ? 'उपयोगकर्ता समीक्षा' : 'User Reviews'}
            </div>
            <h2 className="sec-title">{lang === 'hi' ? 'हमारे <em>ग्राहक</em> क्या कहते हैं' : 'What Our <em>Users</em> Say'}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(201,168,76,0.1)' }} className="max-md:grid-cols-1" ref={addFadeRef}>
            {[
              { stars: '★★★★★', text: '"The astrologer was incredibly accurate about my career path. The detailed analysis gave me clarity I had been seeking for months."', author: '— Priya S.' },
              { stars: '★★★★★', text: '"Very professional platform. Got an instant consultation during a tough time. Highly recommended for anyone seeking guidance."', author: '— Rahul M.' },
              { stars: '★★★★★', text: '"The Vedic astrology session was eye-opening. Detailed analysis and practical remedies that actually made a difference in my life."', author: '— Anika K.' },
            ].map((item, i) => (
              <div key={i} className="astro-card" style={{ padding: '2.5rem 2rem' }}>
                <div style={{ color: 'var(--gold)', fontSize: '.85rem', letterSpacing: '.1em', marginBottom: '1rem' }}>{item.stars}</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', fontStyle: 'italic', lineHeight: 1.8, color: 'var(--light)', marginBottom: '1.5rem' }}>{item.text}</p>
                <div style={{ fontSize: '.72rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>{item.author}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}

export default HomePage
