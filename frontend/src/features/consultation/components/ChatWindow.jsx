import { useState, useRef, useEffect } from 'react'
import { FiSend, FiSmile } from 'react-icons/fi'
import MessageBubble from './MessageBubble'

const ChatWindow = ({ messages = [], onSendMessage, onTyping, isTyping }) => {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    onSendMessage(message.trim())
    setMessage('')
  }

  const handleTyping = (e) => {
    setMessage(e.target.value)
    onTyping?.()
  }

  return (
    <div className="flex flex-col h-full bg-cosmic-2 rounded-2xl border border-white/5">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id || idx} message={msg} />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            Typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <FiSmile className="text-gray-400" />
          </button>
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-cosmic-3 text-light text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2.5 bg-gold text-cosmic rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatWindow
