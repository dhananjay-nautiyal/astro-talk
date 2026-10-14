import { useState } from 'react'
import { createRazorpayOrder, verifyPayment } from '../../../api/walletAPI'
import { openRazorpayCheckout } from '../../../utils/razorpay'
import { useDispatch } from 'react-redux'
import { addBalance, addTransaction } from '../store/walletSlice'
import toast from 'react-hot-toast'

const RazorpayButton = ({ amount, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const handlePayment = async () => {
    if (!amount || amount < 10) {
      toast.error('Minimum amount is ₹10')
      return
    }
    setLoading(true)
    try {
      const { data: order } = await createRazorpayOrder(amount)
      await openRazorpayCheckout(
        order,
        async (response) => {
          try {
            const { data } = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            dispatch(addBalance(data.amount))
            dispatch(addTransaction(data.transaction))
            toast.success('Money added successfully!')
            onSuccess?.()
          } catch {
            toast.error('Payment verification failed')
          }
        },
        (err) => {
          toast.error(err.message || 'Payment cancelled')
        }
      )
    } catch {
      toast.error('Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="flex items-center gap-2 px-6 py-3 bg-gold text-cosmic rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
    >
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </button>
  )
}

export default RazorpayButton
