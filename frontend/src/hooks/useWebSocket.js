import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage } from '../store/consultationSlice'
import { addNotification } from '../store/notificationSlice'

const useWebSocket = (consultationId) => {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.auth)
  const stompClient = useRef(null)
  const subscriptions = useRef([])

  useEffect(() => {
    if (!token || !user) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: () => {
        if (consultationId) {
          const chatSub = client.subscribe(
            `/topic/consultation/${consultationId}`,
            (message) => {
              const chatMessage = JSON.parse(message.body)
              dispatch(addMessage(chatMessage))
            }
          )
          subscriptions.current.push(chatSub)

          const typingSub = client.subscribe(
            `/topic/consultation/${consultationId}/typing`,
            () => {
              // typing indicator handled via local state in component
            }
          )
          subscriptions.current.push(typingSub)

          const signalSub = client.subscribe(
            `/topic/consultation/${consultationId}/signal`,
            () => {
              // WebRTC signals handled in useWebRTC hook
            }
          )
          subscriptions.current.push(signalSub)
        }

        const notifSub = client.subscribe(
          `/topic/user/${user.id}/notifications`,
          (message) => {
            const notification = JSON.parse(message.body)
            dispatch(addNotification(notification))
          }
        )
        subscriptions.current.push(notifSub)

        const callSub = client.subscribe(
          `/topic/user/${user.id}/call`,
          () => {
            // incoming call handled separately
          }        )
        subscriptions.current.push(callSub)
      },
      onDisconnect: () => {},
    })

    client.activate()
    stompClient.current = client

    return () => {
      subscriptions.current.forEach((sub) => sub.unsubscribe())
      subscriptions.current = []
      client.deactivate()
    }
  }, [token, user?.id, consultationId, dispatch])

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

  const disconnect = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.deactivate()
    }
  }, [])

  return { sendMessage, sendTyping, disconnect }
}

export default useWebSocket
