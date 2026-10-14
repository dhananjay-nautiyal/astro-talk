// Central access to public runtime config with explicit missing-key handling.
// Placeholders are never silently used: features check the is*Configured flags.

export const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
export const isRazorpayConfigured =
  razorpayKeyId.length > 0 && razorpayKeyId !== 'rzp_test_placeholder';

export const apiBaseUrl = import.meta.env.VITE_API_URL || '/api'

// WebSocket endpoint. Same-origin '/ws' on web; an absolute https/http URL
// must be baked in for native builds (no same-origin there).
export const wsBaseUrl = import.meta.env.VITE_WS_URL || '/ws'

// Direct APK download link used by landing-page store buttons.
export const appDownloadUrl =
  import.meta.env.VITE_APP_DOWNLOAD_URL ||
  'https://github.com/dhani748/astro-talk/releases/latest';
