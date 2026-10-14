import { useState, useRef, useCallback, useEffect } from 'react'
import SimplePeer from 'simple-peer'

const useWebRTC = (sendMessage) => {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [callStatus, setCallStatus] = useState('idle')
  const peerRef = useRef(null)
  // Ref mirror of the media stream so stable callbacks and the unmount
  // cleanup always stop the current tracks (no stale-closure surprises).
  const localStreamRef = useRef(null)

  const cleanup = useCallback(() => {
    if (peerRef.current) {
      try {
        peerRef.current.destroy()
      } catch {
        // peer already destroyed - safe to ignore
      }
      peerRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    setLocalStream(null)
    setRemoteStream(null)
  }, [])

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      localStreamRef.current = stream
      setLocalStream(stream)
      return stream
    } catch (err) {
      console.error('Failed to get local stream:', err)
      throw err
    }
  }, [])

  const initiateCall = useCallback(async (consultationId, type) => {
    try {
      const stream = await getLocalStream()
      setCallStatus('initiating')

      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
      })

      peer.on('signal', (data) => {
        sendMessage(`/app/consultation/${consultationId}/signal`, {
          type: 'offer',
          signal: data,
          consultationType: type,
        })
      })

      peer.on('stream', (stream) => {
        setRemoteStream(stream)
        setCallStatus('connected')
      })

      peer.on('close', () => {
        setCallStatus('ended')
        cleanup()
      })

      peer.on('error', (err) => {
        console.error('Peer error:', err)
        setCallStatus('error')
      })

      peerRef.current = peer
    } catch {
      setCallStatus('error')
    }
  }, [getLocalStream, sendMessage, cleanup])

  const answerCall = useCallback(async (signal) => {
    try {
      const stream = await getLocalStream()
      setCallStatus('connecting')

      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream,
      })

      peer.on('signal', (data) => {
        sendMessage('/app/consultation/signal', {
          type: 'answer',
          signal: data,
        })
      })

      peer.on('stream', (stream) => {
        setRemoteStream(stream)
        setCallStatus('connected')
      })

      peer.on('close', () => {
        setCallStatus('ended')
        cleanup()
      })

      peer.on('error', (err) => {
        console.error('Peer error:', err)
        setCallStatus('error')
      })

      peer.signal(signal)
      peerRef.current = peer
    } catch {
      setCallStatus('error')
    }
  }, [getLocalStream, sendMessage, cleanup])

  const endCall = useCallback(() => {
    cleanup()
    setCallStatus('ended')
  }, [cleanup])

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return { localStream, remoteStream, callStatus, initiateCall, answerCall, endCall }
}

export default useWebRTC
