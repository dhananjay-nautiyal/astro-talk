import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

// True when the app runs installed: native Capacitor shell, PWA
// standalone display-mode, or iOS standalone. Used to hide "download
// the app" prompts that make no sense when already installed.
export function useIsInstalled() {
  const [installed, setInstalled] = useState(() => isInstalledNow())

  useEffect(() => {
    const mq = window.matchMedia?.('(display-mode: standalone)')
    if (!mq?.addEventListener) return
    const onChange = () => setInstalled(isInstalledNow())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return installed
}

function isInstalledNow() {
  if (typeof window === 'undefined') return false
  if (Capacitor.isNativePlatform()) return true
  if (window.navigator.standalone === true) return true
  return window.matchMedia?.('(display-mode: standalone)').matches === true
}
