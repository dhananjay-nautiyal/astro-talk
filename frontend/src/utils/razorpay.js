import { razorpayKeyId, isRazorpayConfigured } from './env'

export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(script)
  })
}

export const openRazorpayCheckout = async (order, onSuccess, onFailure) => {
  try {
    if (!isRazorpayConfigured) {
      throw new Error('Razorpay is not configured (VITE_RAZORPAY_KEY_ID). See frontend/.env.example.')
    }
    await loadRazorpayScript()
    const options = {
      key: razorpayKeyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'AstroTalk',
      description: 'Add money to wallet',
      order_id: order.id,
      handler: (response) => {
        onSuccess(response)
      },
      prefill: {
        name: order.userName || '',
        email: order.userEmail || '',
        contact: order.userPhone || '',
      },
      theme: {
        color: '#6B21A8',
      },
      modal: {
        ondismiss: () => {
          onFailure?.(new Error('Payment cancelled'))
        },
      },
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (error) {
    onFailure?.(error)
  }
}
