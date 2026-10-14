import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { FiSmartphone, FiCheck } from 'react-icons/fi'
import { useIsInstalled } from '../../../hooks/useIsInstalled'
import { appDownloadUrl } from '../../../utils/env'

const features = [
  'Instant 1-on-1 consultations',
  'Secure payments & privacy',
  'Available in 13 languages',
  '24/7 customer support',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function MobileAppSection() {
  const installed = useIsInstalled()
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const phoneRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!phoneRef.current) return
    const rect = phoneRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    setTilt({
      x: (-mouseY / (rect.height / 2)) * 8,
      y: (mouseX / (rect.width / 2)) * 8,
    })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0d0d1a] py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="order-2 lg:order-1"
          >
            <motion.span
              variants={itemVariants}
              className="relative inline-block font-['Playfair_Display'] text-sm font-semibold uppercase tracking-[0.2em] text-gold/80 mb-4"
            >
              Mobile App
              <span className="absolute -bottom-1 left-0 h-[2px] w-10 rounded bg-gold" />
            </motion.span>

            <motion.h2
              variants={itemVariants}
              className="font-['Playfair_Display'] text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl mb-6"
            >
              Your Astrologer{' '}
              <span className="text-gold">In Your Pocket</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-base leading-relaxed text-white/60 mb-8 max-w-lg"
            >
              Download the AstroTalk app and get instant access to verified
              astrologers anytime, anywhere. Voice, video, or chat — your choice.
            </motion.p>

            <motion.ul
              variants={containerVariants}
              className="mb-10 space-y-3"
            >
              {features.map((feature) => (
                <motion.li
                  key={feature}
                  variants={itemVariants}
                  className="flex items-center gap-3 text-white/80"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-amber-500">
                    <FiCheck className="h-3.5 w-3.5 text-[#0d0d1a]" />
                  </span>
                  <span className="text-sm sm:text-base">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              {installed ? (
                <p className="text-sm text-white/60">
                  You are using the AstroTalk app — all features are already unlocked here.
                </p>
              ) : (
              <>
              <a
                href={appDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:border-gold/50 hover:bg-white/10 hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.25)]"
              >
                <FiSmartphone className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <div className="text-left">
                  <span className="block text-[10px] leading-tight text-white/40">
                    Get it on
                  </span>
                  <span className="block text-sm font-semibold">Android (APK)</span>
                </div>
              </a>
              </>
              )}
            </motion.div>
          </motion.div>

          {/* Right Column - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className="order-1 flex justify-center lg:order-2"
          >
            <div className="relative flex items-center justify-center">
              {/* Glow Effect */}
              <div className="absolute h-80 w-80 rounded-full bg-gradient-to-br from-orange-500/25 via-gold/20 to-purple-500/10 blur-[100px] animate-pulse" />

              {/* Phone Container */}
              <motion.div
                ref={phoneRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformPerspective: 1200 }}
                animate={{
                  y: [0, -12, 0],
                  rotateX: tilt.x,
                  rotateY: tilt.y,
                }}
                transition={{
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                  rotateX: { type: 'spring', stiffness: 150, damping: 15 },
                  rotateY: { type: 'spring', stiffness: 150, damping: 15 },
                }}
                className="relative h-[500px] w-[250px] rounded-[2.5rem] border-4 border-white/10 bg-gradient-to-b from-gray-900 to-gray-950 shadow-2xl shadow-gold/10"
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-gray-900">
                  <div className="mx-auto mt-1.5 h-3 w-3 rounded-full bg-gray-800 border border-white/5" />
                </div>

                {/* Screen */}
                <div className="m-2 h-[calc(100%-16px)] overflow-hidden rounded-[2rem] bg-gradient-to-b from-gold/90 via-purple-800 to-purple-950">
                  {/* Screen Content */}
                  <div className="flex h-full flex-col px-4 pt-14 pb-6">
                    {/* Stars decoration */}
                    <div className="absolute top-8 left-6 text-gold/60 text-xs">✦</div>
                    <div className="absolute top-12 right-8 text-white/20 text-sm">✦</div>
                    <div className="absolute top-20 left-10 text-gold/30 text-[10px]">✧</div>
                    <div className="absolute top-6 right-4 text-white/10 text-lg">✦</div>

                    {/* Header */}
                    <div className="flex items-center justify-center gap-2 mb-5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                        <span className="text-xs">✦</span>
                      </div>
                      <h3 className="font-['Playfair_Display'] text-base font-bold text-white">
                        AstroTalk
                      </h3>
                    </div>

                    {/* Chat bubbles */}
                    <div className="flex flex-col gap-2">
                      <div className="self-start max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 backdrop-blur px-3 py-2">
                        <p className="text-[10px] leading-relaxed text-white/80">
                          When will I find love? 💫
                        </p>
                      </div>
                      <div className="self-end max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-r from-gold to-amber-400 px-3 py-2">
                        <p className="text-[10px] leading-relaxed text-[#0d0d1a] font-medium">
                          The stars align for you next month! ✨
                        </p>
                      </div>
                      <div className="self-start max-w-[85%] rounded-2xl rounded-bl-md bg-white/10 backdrop-blur px-3 py-2">
                        <p className="text-[10px] leading-relaxed text-white/80">
                          Check your career horoscope 🔮
                        </p>
                      </div>
                    </div>

                    {/* Star rating */}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-[9px] text-gold">
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-[8px] text-white/40">Live · 2.3k</span>
                    </div>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-white/20" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gold/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/5 blur-[120px]" />
    </section>
  )
}
