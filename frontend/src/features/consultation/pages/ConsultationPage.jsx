import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getConsultationById, endConsultation } from '../../../api/consultationAPI'
import { getChatHistory } from '../../../api/chatAPI'
import { setActiveConsultation, updateConsultationStatus, addMessage, setMessages } from '../store/consultationSlice'
import { useSocket } from '../../../context/SocketContext'
import ChatWindow from '../components/ChatWindow'
import VideoCallUI from '../components/VideoCallUI'
import VoiceCallUI from '../components/VoiceCallUI'
import BalanceWarning from '../components/BalanceWarning'
import Modal from '../../../components/common/Modal'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { FiPhone, FiMessageCircle, FiVideo } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ConsultationPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { balance } = useSelector((state) => state.wallet)
  // Messages live in the Redux store so both the history load and incoming
  // socket frames (dispatched via addMessage) render in the same list.
  const messages = useSelector((state) => state.consultation.messages)
  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [consultationType, setConsultationType] = useState(searchParams.get('type') || 'chat')
  const [isTyping, setIsTyping] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [speakerOn, setSpeakerOn] = useState(false)
  const typingTimeout = useRef(null)

  const { subscribeToConsultation, unsubscribeAll, sendMessage, sendTyping, localStream, remoteStream, initiateCall, endCall } = useSocket()

  useEffect(() => {
    subscribeToConsultation(id)
    return () => unsubscribeAll()
  }, [id])

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const { data } = await getConsultationById(id)
        setConsultation(data)
        dispatch(setActiveConsultation(data))
        setConsultationType(data.type || consultationType)

        if (data.type !== 'chat') {
          if (data.type === 'video') await initiateCall(id, 'video')
          else await initiateCall(id, 'voice')
        }

        const messagesRes = await getChatHistory(id)
        dispatch(setMessages(messagesRes.data || []))
      } catch {
        toast.error('Failed to load consultation')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchConsultation()
  }, [id])

  const handleSendMessage = useCallback((content) => {
    const message = {
      consultationId: id,
      senderId: user?.id,
      content,
      timestamp: new Date().toISOString(),
    }
    sendMessage(`/app/consultation/${id}/chat`, message)
    dispatch(addMessage(message))
  }, [id, user, sendMessage, dispatch])

  const handleTyping = useCallback(() => {
    sendTyping(id, user?.id)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => setIsTyping(false), 2000)
  }, [id, user, sendTyping])

  const handleEndConsultation = async () => {
    try {
      await endConsultation(id)
      if (consultationType !== 'chat') endCall()
      dispatch(updateConsultationStatus('ended'))
      toast.success('Consultation ended')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to end consultation')
    }
  }

  if (loading) return <LoadingSpinner className="py-20" size="lg" />

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col page-transition">
      <div className="flex items-center justify-between px-6 py-3 bg-cosmic-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img
            src={consultation?.astrologerPhoto || `https://ui-avatars.com/api/?name=${consultation?.astrologerName || 'A'}&background=6B21A8&color=fff&size=40`}
            alt={consultation?.astrologerName}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-light text-sm">{consultation?.astrologerName || 'Astrologer'}</h3>
            <p className="text-xs text-muted capitalize">{consultationType} consultation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BalanceWarning balance={balance} />
          {consultationType === 'chat' && (
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
              <button className="p-2 bg-cosmic-3 rounded-lg shadow-sm"><FiMessageCircle size={16} className="text-gold" /></button>
              <button onClick={() => { setConsultationType('audio'); initiateCall(id, 'audio') }} className="p-2 rounded-lg hover:bg-white/10"><FiPhone size={16} className="text-muted" /></button>
              <button onClick={() => { setConsultationType('video'); initiateCall(id, 'video') }} className="p-2 rounded-lg hover:bg-white/10"><FiVideo size={16} className="text-muted" /></button>
            </div>
          )}
          <button onClick={() => setShowEndModal(true)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">
            End
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {consultationType === 'chat' ? (
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            consultationId={id}
            isTyping={isTyping}
          />
        ) : consultationType === 'video' ? (
          <VideoCallUI
            localStream={localStream}
            remoteStream={remoteStream}
            onEndCall={() => setShowEndModal(true)}
            muted={muted}
            cameraOff={cameraOff}
            onToggleMute={() => setMuted(!muted)}
            onToggleCamera={() => setCameraOff(!cameraOff)}
          />
        ) : (
          <VoiceCallUI
            onEndCall={() => setShowEndModal(true)}
            muted={muted}
            speakerOn={speakerOn}
            onToggleMute={() => setMuted(!muted)}
            onToggleSpeaker={() => setSpeakerOn(!speakerOn)}
            astrologer={consultation?.astrologerName}
          />
        )}
      </div>

      <Modal isOpen={showEndModal} onClose={() => setShowEndModal(false)} title="End Consultation" size="sm">
        <p className="text-muted mb-6">Are you sure you want to end this consultation?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowEndModal(false)} className="px-4 py-2 rounded-lg border border-white/10 text-light hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={handleEndConsultation} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            End Consultation
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default ConsultationPage
