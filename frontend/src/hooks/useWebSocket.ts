// @ts-nocheck
import { useEffect, useRef, useState, useCallback } from 'react'

export const useWebSocket = (url, onMessage) => {
  const ws = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return

    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        setIsConnected(true)
        setError(null)
      }

      ws.current.onmessage = (event) => {
        let data
        try {
          data = JSON.parse(event.data)
        } catch {
          console.error('useWebSocket: received non-JSON message', event.data)
          return
        }
        onMessage?.(data)
      }

      ws.current.onerror = () => {
        setError('Connection error')
        setIsConnected(false)
      }

      ws.current.onclose = () => {
        setIsConnected(false)
      }
    } catch {
      setError('Failed to connect')
    }
  }, [url, onMessage])

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close()
      ws.current = null
      setIsConnected(false)
    }
  }, [])

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected,
    error,
  }
}

export default useWebSocket
