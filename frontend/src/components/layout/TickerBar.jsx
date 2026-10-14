import { FiUsers, FiClock, FiGlobe } from 'react-icons/fi'

const items = [
  { icon: FiUsers, value: '120.2M+', label: 'Customers' },
  { icon: FiClock, value: '1326 Million+', label: 'Minutes' },
  { icon: FiGlobe, value: '13 Languages', label: '' },
]

export default function TickerBar() {
  const line = items
    .map((item) => `${item.value} ${item.label}`)
    .join(' <span class="sep">✦</span> ')

  const duplicated = `${line} <span class="sep">✦</span> ${line}`

  return (
    <div className="marquee-bar">
      <div className="marquee-inner" dangerouslySetInnerHTML={{ __html: duplicated }} />
    </div>
  )
}
