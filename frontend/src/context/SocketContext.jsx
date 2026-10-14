/* eslint-disable react-refresh/only-export-components -- context modules intentionally export the provider plus its hook */
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useSelector, useDispatch } from 'react-redux'
import { addMessage } from '../store/consultationSlice'
import { addNotification } from '../store/notificationSlice'
import SimplePeer from 'simple-peer'

const SocketContext = createContext(null)

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch()
  const { token, user } = useSelector((state) => state.auth)
  const stompClient = useRef(null)
  const subscriptions = useRef([])
  const [connected, setConnected] = useState(false)

  const peerRef = useRef(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [callStatus, setCallStatus] = useState('idle')
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

  useEffect(() => {
    if (!token || !user) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
      },
      onDisconnect: () => {
        setConnected(false)
      },
    })

    client.activate()
    stompClient.current = client

    return () => {
      subscriptions.current.forEach((sub) => sub.unsubscribe())
      subscriptions.current = []
      client.deactivate()
      stompClient.current = null
      setConnected(false)
    }
  }, [token, user])

  const subscribeToConsultation = useCallback((consultationId) => {
    const client = stompClient.current
    if (!client?.connected) return

    const chatSub = client.subscribe(`/topic/consultation/${consultationId}`, (message) => {
      const chatMessage = JSON.parse(message.body)
      dispatch(addMessage(chatMessage))
    })
    subscriptions.current.push(chatSub)

    const typingSub = client.subscribe(`/topic/consultation/${consultationId}/typing`, () => {})
    subscriptions.current.push(typingSub)

    const signalSub = client.subscribe(`/topic/consultation/${consultationId}/signal`, (message) => {
      const { type, signal } = JSON.parse(message.body)
      if (type === 'offer' && peerRef.current && !peerRef.current.initiator) {
        peerRef.current.signal(signal)
      } else if (type === 'answer' && peerRef.current?.initiator) {
        peerRef.current.signal(signal)
      }
    })
    subscriptions.current.push(signalSub)

    const notifSub = client.subscribe(`/topic/user/${user.id}/notifications`, (message) => {
      const notification = JSON.parse(message.body)
      dispatch(addNotification(notification))
    })
    subscriptions.current.push(notifSub)

    const callSub = client.subscribe(`/topic/user/${user.id}/call`, () => {})
    subscriptions.current.push(callSub)
  }, [dispatch, user])

  const unsubscribeAll = useCallback(() => {
    subscriptions.current.forEach((sub) => sub.unsubscribe())
    subscriptions.current = []
  }, [])

  const sendMessage = useCallback((destination, body) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination,
        body: JSON.stringify(body),
      })
    }
  }, [])

  const sendTyping = useCallback((consultationId, userId) => {
    if (stompClient.current?.connected) {
      stompClient.current.publish({
        destination: `/app/consultation/${consultationId}/typing`,
        body: JSON.stringify({ userId }),
      })
    }
  }, [])

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
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

  return (
    <SocketContext.Provider value={{
      connected,
      subscribeToConsultation,
      unsubscribeAll,
      sendMessage,
      sendTyping,
      localStream,
      remoteStream,
      callStatus,
      initiateCall,
      answerCall,
      endCall,
    }}>
      {children}
    </SocketContext.Provider>
  )
}
