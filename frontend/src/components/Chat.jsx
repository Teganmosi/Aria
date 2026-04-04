import { useState, useRef, useEffect } from 'react'
import useWebSocket from '../hooks/useWebSocket'

const Chat = ({ sessionId, sessionType }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/${sessionType}/${sessionId}`

  const handleMessage = (data) => {
    if (data.type === 'message') {
      setMessages(prev => [...prev, { role: data.role, content: data.content }])
    }
  }

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
      setMessages(prev => [...prev, { role: 'user', content: inputMessage }])
      setInputMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>Real-time Chat</span>
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '●' : '○'}
        </span>
      </div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="input"
        />
        <button onClick={handleSend} className="btn btn-primary" disabled={!isConnected}>
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat
