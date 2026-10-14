import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { APP_VERSION, compareVersions } from '../utils/version'

const RELEASE_API = 'https://api.github.com/repos/dhani748/astro-talk/releases/latest'
const DISMISS_KEY = 'update-prompt-dismissed'

// Checks GitHub for a newer release once per app launch. Shows an
// Update/Later popup when one exists. "Later" dismisses only for this
// session, so the popup returns on the next app open.
export function useUpdateCheck() {
  const [update, setUpdate] = useState(null)

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (compareVersions(data.tag_name, APP_VERSION) <= 0) return
        const apk = (data.assets || []).find((a) => a.name.endsWith('.apk'))
        setUpdate({
          version: data.tag_name,
          notes: data.body || '',
          apkUrl: apk ? apk.browser_download_url : data.html_url,
        })
      } catch {
        // offline or rate-limited - stay silent, try again next launch
      }
    }, 1500)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setUpdate(null)
  }

  const applyUpdate = async () => {
    if (Capacitor.isNativePlatform()) {
      // Native shell cannot self-update: hand the APK to the system installer.
      window.location.href = update.apkUrl
      return
    }
    try {
      const reg = await navigator.serviceWorker?.getRegistration()
      await reg?.update()
    } catch {
      // fall through to reload
    }
    window.location.reload()
  }

  return { update, dismiss, applyUpdate }
}
