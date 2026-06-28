import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3000'

export const useSocket = (username) => {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!username) return

    socketRef.current = io(SOCKET_URL)
    socketRef.current.emit('user_online', username)

    return () => {
      socketRef.current.disconnect()
    }
  }, [username])

  const sendMessage = (to, text, from) => {
    socketRef.current?.emit('private_message', { to, text, from })
  }

  const getHistory = (user1, user2) => {
    socketRef.current?.emit('get_history', { user1, user2 })
  }

  const sendTyping = (to, from) => {
    socketRef.current?.emit('typing', { to, from })
  }

  const stopTyping = (to, from) => {
    socketRef.current?.emit('stop_typing', { to, from })
  }

  const onMessage = (callback) => {
    socketRef.current?.on('private_message', callback)
  }

  const onHistory = (callback) => {
    socketRef.current?.on('history', callback)
  }

  const onOnlineUsers = (callback) => {
    socketRef.current?.on('online_users', callback)
  }

  const onTyping = (callback) => {
    socketRef.current?.on('typing', callback)
  }

  const onStopTyping = (callback) => {
    socketRef.current?.on('stop_typing', callback)
  }

  return {
    socket: socketRef.current,
    sendMessage,
    getHistory,
    sendTyping,
    stopTyping,
    onMessage,
    onHistory,
    onOnlineUsers,
    onTyping,
    onStopTyping
  }
}