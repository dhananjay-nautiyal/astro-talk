// Central access to public runtime config with explicit missing-key handling.
// Placeholders are never silently used: features check the is*Configured flags.

export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const isGoogleConfigured =
  googleClientId.length > 0 && !googleClientId.includes('your-google-client-id');

export const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
export const isRazorpayConfigured =
  razorpayKeyId.length > 0 && razorpayKeyId !== 'rzp_test_placeholder';

export const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
