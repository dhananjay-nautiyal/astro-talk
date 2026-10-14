// Baked-in app version. Bump on every release (kept in sync with
// package.json + Android versionName) so the update prompt can compare.
export const APP_VERSION = '1.2.0'

export function parseVersion(tag) {
  return String(tag || '')
    .trim()
    .replace(/^v/i, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0)
}

// >0 when a is newer than b, <0 when older, 0 when equal.
export function compareVersions(a, b) {
  const pa = parseVersion(a)
  const pb = parseVersion(b)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0)
    if (diff !== 0) return diff
  }
  return 0
}
