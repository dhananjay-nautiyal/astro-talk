// Strict client-side validation so obviously fake addresses never reach the API.
// Requires dot-atom local part, @, domain with at least one dot and a 2+ letter TLD.

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/

export function normalizeEmail(value) {
  return (value || '').trim().toLowerCase()
}

export function isValidEmail(value) {
  const email = normalizeEmail(value)
  if (email.length > 254 || email.length < 6) return false
  if (email.includes('..')) return false
  return EMAIL_RE.test(email)
}
