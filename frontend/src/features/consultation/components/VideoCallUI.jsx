import { useRef, useEffect } from 'react'
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from 'react-icons/fi'
import CallTimer from './CallTimer'

const VideoCallUI = ({ localStream, remoteStream, onEndCall, muted, cameraOff, onToggleMute, onToggleCamera }) => {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden h-full min-h-[400px]">
      {remoteStream ? (
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
            <FiVideoOff size={32} className="text-gray-500" />
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-32 h-24 object-cover rounded-xl border-2 border-white/30 shadow-lg"
        />
      </div>

      <div className="absolute top-4 left-4">
        <CallTimer />
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <button
          onClick={onToggleMute}
          className={`p-3 rounded-full transition-colors ${muted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
        >
          {muted ? <FiMicOff size={20} /> : <FiMic size={20} />}
        </button>
        <button
          onClick={onEndCall}
          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        >
          <FiPhoneOff size={20} />
        </button>
        <button
          onClick={onToggleCamera}
          className={`p-3 rounded-full transition-colors ${cameraOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
        >
          {cameraOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
        </button>
      </div>
    </div>
  )
}

export default VideoCallUI
