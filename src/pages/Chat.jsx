import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import useStore from '../store/useStore'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'

export default function Chat() {
  const { user, setUsers, setOnlineUsers, addMessage, setMessages, currentChat, logout } = useStore()
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io('http://localhost:4000')
    
    socketRef.current.emit('user_online', user.username)

    Notification.requestPermission()

    socketRef.current.on('online_users', (users) => {
      setOnlineUsers(users)
    })

  socketRef.current.on('private_message', (msg) => {
  addMessage(msg)
  if (msg.from !== user.username) {
    showNotification(msg.from, msg.text)
    if (useStore.getState().currentChat !== msg.from) {
      useStore.getState().addUnread(msg.from)
    }
  }
})

    socketRef.current.on('history', (messages) => {
      setMessages(messages)
    })

    socketRef.current.on('typing', ({ from }) => {
      useStore.getState().setTypingUser(from)
    })

    socketRef.current.on('stop_typing', ({ from }) => {
      useStore.getState().setTypingUser(null)
    })

    loadUsers()
    const interval = setInterval(loadUsers, 3000)

    const showNotification = (from, text) => {
  // Запрашиваем разрешение
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }

  if (Notification.permission === 'granted') {
    // Не показываем если чат открыт и страница активна
    if (document.hasFocus() && useStore.getState().currentChat === from) return

    const notification = new Notification(`💬 GI Chat — ${from}`, {
  body: text?.startsWith('http://localhost:4000/uploads/') ? '🖼 Фото' : text,
  icon: '💬'
})

    setTimeout(() => notification.close(), 4000)

    notification.onclick = () => {
      window.focus()
      openChat(from)
    }
  }
}

    return () => {
      socketRef.current.disconnect()
      clearInterval(interval)
    }
  }, [])

  const loadUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/auth/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.users.filter(u => u.username !== user.username))
      }
    } catch(e) {}
  }

 const sendMessage = (text, type = 'text') => {
  if (!text || !currentChat) return
  socketRef.current?.emit('private_message', {
    from: user.username,
    to: currentChat,
    text,
    type
  })
}

  const openChat = (username) => {
  useStore.getState().setCurrentChat(username)
  useStore.getState().clearUnread(username)
  socketRef.current?.emit('get_history', { 
    user1: user.username, 
    user2: username 
  })
}

  const sendTyping = (to) => {
    socketRef.current?.emit('typing', { to, from: user.username })
  }

  const stopTyping = (to) => {
    socketRef.current?.emit('stop_typing', { to, from: user.username })
  }

  return (
    <div style={styles.container}>
      <Sidebar onOpenChat={openChat} onLogout={logout} />
      <ChatWindow 
        onSendMessage={sendMessage} 
        onTyping={sendTyping} 
        onStopTyping={stopTyping} 
      />
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#0f0f0f',
    overflow: 'hidden',
  }
}