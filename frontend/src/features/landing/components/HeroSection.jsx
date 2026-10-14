import { motion } from 'framer-motion'
import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useIsInstalled } from '../../../hooks/useIsInstalled'
import { appDownloadUrl } from '../../../utils/env'

const ParticleBackground = lazy(() => import('./ParticleBackground'))
const ZodiacWheel = lazy(() => import('./ZodiacWheel'))

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
}

const avatarUrls = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=2',
  'https://i.pravatar.cc/100?img=3',
  'https://i.pravatar.cc/100?img=4',
  'https://i.pravatar.cc/100?img=5',
]

const trustIndicators = [
  'Verified Astrologers',
  'Secure & Private',
  'Available 24/7',
  '4.9 Rating',
]

const statChips = [
  { value: '120M+', label: 'Consultations' },
  { value: '48K+', label: 'Astrologers' },
  { value: '13', label: 'Languages' },
]

export default function HeroSection() {
  const installed = useIsInstalled()
  return (
    <section className="relative min-h-screen overflow-hidden bg-cosmic">
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0">
          <ParticleBackground />
        </div>
      </Suspense>

      <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-24 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            <motion.div
              variants={itemVariants}
              className="mb-8 inline-flex items-center gap-2 self-start rounded-full border border-gold/20 bg-white/5 px-4 py-1.5 text-sm font-medium tracking-wide text-gold-light backdrop-blur-md"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold shadow-[0_0_8px_#D4AF37]" />
              48,726+ Astrologers Online
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              <span className="bg-gradient-to-r from-gold via-gold-light to-white bg-clip-text text-transparent">
                Talk To Astrologers
              </span>
              <br />
              <span className="bg-gradient-to-r from-gold via-gold-light to-white bg-clip-text text-transparent">
                Right Now
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            >
              Get personalized astrological guidance from verified experts. Chat or call
              anytime, anywhere.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/astrologers"
                className="inline-block rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-105"
              >
                Start Free Consultation
              </Link>
              {!installed && (
              <a
                href={appDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:border-white/30"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
                Download App
              </a>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-wrap gap-x-8 gap-y-2"
            >
              {trustIndicators.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 text-sm text-white/60">
                  <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </span>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-6"
            >
              <div className="flex -space-x-3">
                {avatarUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="h-10 w-10 rounded-full border-2 border-cosmic object-cover"
                  />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-white/60">
                  <span className="font-semibold text-white">4.9</span> (10,000+ Reviews)
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap gap-3"
            >
              {statChips.map((chip) => (
                <div
                  key={chip.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl"
                >
                  <span className="text-sm font-bold text-gold">{chip.value}</span>
                  <span className="text-sm text-white/60">{chip.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right 3D Visualization */}
          <div className="relative hidden h-[600px] lg:block">
            <Suspense fallback={null}>
              <div className="absolute inset-0">
                <ZodiacWheel />
              </div>
            </Suspense>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-cosmic" />
          </div>
        </div>
      </div>
    </section>
  )
}
