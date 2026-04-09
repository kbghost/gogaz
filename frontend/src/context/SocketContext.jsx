import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socketRef.current.on('connect', () => setConnected(true))
    socketRef.current.on('disconnect', () => setConnected(false))

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const trackCommande = (commandeId) => {
    socketRef.current?.emit('track_commande', commandeId)
  }

  const updatePosition = (commandeId, lat, lng) => {
    socketRef.current?.emit('update_position', { commandeId, lat, lng })
  }

  const on = (event, handler) => {
    socketRef.current?.on(event, handler)
    return () => socketRef.current?.off(event, handler)
  }

  const off = (event, handler) => {
    socketRef.current?.off(event, handler)
  }

  return (
    <SocketContext.Provider value={{ connected, trackCommande, updatePosition, on, off, socket: socketRef }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
