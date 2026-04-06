import { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import useWebSocket from '../hooks/useWebSocket'

const Chat = ({ sessionId, sessionType }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/${sessionType}/${sessionId}`

  const handleMessage = useCallback((data) => {
    if (data.type === 'message') {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        role: data.role,
        content: data.content
      }])
    }
  }, [])

  const { connect, disconnect, sendMessage, isConnected } = useWebSocket(wsUrl, handleMessage)

  useEffect(() => {
    if (sessionId) {
      connect()
    }
    return () => disconnect()
  }, [sessionId, connect, disconnect])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!inputMessage.trim()) return

    const success = sendMessage({
      type: 'message',
      role: 'user',
      content: inputMessage
    })

    if (success) {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        role: 'user',
        content: inputMessage
      }])
      setInputMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>Real-time Interaction</span>
        <div
          className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}
          title={isConnected ? 'Sanctuary Online' : 'Sanctuary Offline'}
        >
          {isConnected ? '●' : '○'}
        </div>
      </div>
      <div className="messages" role="log" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <fieldset className="chat-input" aria-label="Message composition">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message to the sanctuary..."
          className="input"
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          className="btn btn-primary"
          disabled={!isConnected}
          aria-label="Send message"
        >
          Send
        </button>
      </fieldset>
    </div>
  )
}

Chat.propTypes = {
  sessionId: PropTypes.string.isRequired,
  sessionType: PropTypes.string.isRequired,
}

export default Chat
