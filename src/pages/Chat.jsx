import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import useStore from '../store/useStore'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'

export default function Chat() {
  const { user, setUsers, setOnlineUsers, addMessage, setMessages, currentChat, currentGroup, setGroups, addGroup, logout } = useStore()
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io('https://gi-chat-production.up.railway.app')
    socketRef.current.emit('user_online', user.username)
    socketRef.current.emit('get_groups', user.username)

    socketRef.current.on('online_users', (users) => setOnlineUsers(users))

    socketRef.current.on('private_message', (msg) => {
      addMessage(msg)
      if (msg.from !== user.username) {
        showNotification(msg.from, msg.text)
        if (useStore.getState().currentChat !== msg.from) {
          useStore.getState().addUnread(msg.from)
        }
      }
    })

    socketRef.current.on('history', (messages) => setMessages(messages))
    socketRef.current.on('groups', (groups) => setGroups(groups))
    socketRef.current.on('group_created', (group) => addGroup(group))

    socketRef.current.on('group_message', (msg) => {
      if (useStore.getState().currentGroup?.id === msg.groupId) {
        addMessage(msg)
      }
    })

    socketRef.current.on('group_history', (messages) => setMessages(messages))

    socketRef.current.on('typing', ({ from }) => {
      useStore.getState().setTypingUser(from)
    })

    socketRef.current.on('stop_typing', ({ from }) => {
      useStore.getState().setTypingUser(null)
    })

    socketRef.current.on('messages_read', ({ from, to }) => {
      useStore.getState().markMessagesRead(from, to)
      socketRef.current.emit('get_history', {
        user1: user.username,
        user2: from === user.username ? to : from
      })
    })

    Notification.requestPermission()
    loadUsers()
    const interval = setInterval(loadUsers, 3000)

    return () => {
      socketRef.current.disconnect()
      clearInterval(interval)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUsers = async () => {
    try {
      const res = await fetch('https://gi-chat-production.up.railway.app/api/auth/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.users.filter(u => u.username !== user.username))
      }
      const blockRes = await fetch(`https://gi-chat-production.up.railway.app/api/auth/blocks/${user.username}`)
      const blockData = await blockRes.json()
      if (blockData.success) {
        useStore.getState().setBlockedUsers(blockData.blocks)
      }
    } catch(e) {}
  }

  const showNotification = (from, text) => {
    if (Notification.permission === 'granted') {
      if (document.hasFocus() && useStore.getState().currentChat === from) return
      const notification = new Notification(`💬 GI Chat — ${from}`, {
        body: text?.startsWith('https://gi-chat-production.up.railway.app/uploads/') ? '🖼 Фото' : text,
        icon: '💬'
      })
      setTimeout(() => notification.close(), 4000)
      notification.onclick = () => {
        window.focus()
        openChat(from)
      }
    }
  }

  const sendMessage = (text, type = 'text') => {
    if (!text) return
    if (currentGroup) {
      socketRef.current?.emit('group_message', {
        groupId: currentGroup.id,
        from: user.username,
        text,
        type
      })
    } else if (currentChat) {
      socketRef.current?.emit('private_message', {
        from: user.username,
        to: currentChat,
        text,
        type
      })
    }
  }

  const openChat = (username) => {
    useStore.getState().setCurrentChat(username)
    useStore.getState().clearUnread(username)
    socketRef.current?.emit('get_history', {
      user1: user.username,
      user2: username
    })
    socketRef.current?.emit('mark_read', {
      from: username,
      to: user.username
    })
  }

  const openGroup = (group) => {
    useStore.getState().setCurrentGroup(group)
    socketRef.current?.emit('get_group_history', group.id)
  }

  const createGroup = (name, members) => {
    socketRef.current?.emit('create_group', {
      name,
      members,
      creator: user.username
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
      <Sidebar
        onOpenChat={openChat}
        onOpenGroup={openGroup}
        onCreateGroup={createGroup}
        onLogout={logout}
      />
      <ChatWindow
        onSendMessage={sendMessage}
        onTyping={sendTyping}
        onStopTyping={stopTyping}
        socket={socketRef.current}
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