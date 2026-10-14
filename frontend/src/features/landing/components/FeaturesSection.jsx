import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const services = [
  { icon: '🃏', title: 'Tarot Reading', desc: 'Unlock mysteries of your past, present, and future through ancient tarot wisdom.', price: '₹199', tag: 'Popular' },
  { icon: '🔢', title: 'Numerology', desc: 'Discover the power of numbers shaping your destiny and life path.', price: '₹249', tag: 'Best Value' },
  { icon: '🪐', title: 'Vedic Astrology', desc: 'Ancient Indian wisdom offering profound insights into your cosmic blueprint.', price: '₹299', tag: 'Premium' },
  { icon: '✋', title: 'Palm Reading', desc: 'The lines on your palm tell the story of your life. Let experts decode yours.', price: '₹349', tag: 'Expert' },
  { icon: '❤️', title: 'Love & Relationship', desc: 'Navigate love with clarity through compassionate expert guidance.', price: '₹399', tag: 'Popular' },
  { icon: '💼', title: 'Career Consultation', desc: 'Align your professional path with cosmic energies and astrological timing.', price: '₹299', tag: 'Trending' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

function TiltCard({ service }) {
  const cardRef = useRef(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    setRotate({
      x: (-dy / (rect.height / 2)) * 10,
      y: (dx / (rect.width / 2)) * 10,
    })
  }

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 })

  return (
    <motion.div
      variants={itemVariants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformPerspective: 1000 }}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition-all duration-500 hover:border-gold/40 hover:shadow-[0_0_50px_-8px_rgba(212,175,55,0.2)]"
    >
      {service.tag && (
        <span className="absolute right-4 top-4 rounded-full bg-gold/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
          {service.tag}
        </span>
      )}

      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-purple-500/20 text-2xl shadow-lg ring-1 ring-white/10">
        {service.icon}
      </div>

      <h3 className="font-display mb-2 text-xl font-bold text-gold">{service.title}</h3>

      <p className="mb-5 text-sm leading-relaxed text-white/60">{service.desc}</p>

      <div className="flex items-center justify-between">
        <span className="font-display text-lg font-semibold text-white">{service.price}</span>
        <a
          href={`#${service.title.toLowerCase().replace(/\s+/g, '-')}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold transition-all duration-300 hover:bg-gold/20"
        >
          Book Now
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  )
}

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="services" className="relative overflow-hidden bg-[#0d0d1a] py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="relative inline-block font-display mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gold/80"
          >
            Premium Services
            <span className="absolute -bottom-1 left-1/2 h-[2px] w-12 -translate-x-1/2 rounded bg-gold" />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl"
          >
            Explore Our <span className="text-gold">Divine Services</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg"
          >
            From ancient Vedic wisdom to modern tarot, our celestial services illuminate every path of your journey.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <TiltCard key={service.title} service={service} />
          ))}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gold/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/5 blur-[120px]" />
    </section>
  )
}
