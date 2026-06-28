import { useState, useEffect, useRef } from 'react'
import useStore from '../store/useStore'
import Message from './Message'
import EmojiPicker from 'emoji-picker-react'

export default function ChatWindow({ onSendMessage, onTyping, onStopTyping }) {
  const { user, currentChat, messages, typingUser, onlineUsers } = useStore()
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const fileRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

 const handleSend = () => {
  if (!text.trim() || !currentChat) return
  onSendMessage(text.trim(), 'text')
  setText('')
  onStopTyping(currentChat)
}

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    if (!currentChat) return
    onTyping(currentChat)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      onStopTyping(currentChat)
    }, 1500)
  }

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // Показываем превью
  const reader = new FileReader()
  reader.onload = (ev) => {
    setImagePreview({ file, url: ev.target.result })
  }
  reader.readAsDataURL(file)
  fileRef.current.value = ''
}

const sendImage = async () => {
  if (!imagePreview) return

  const formData = new FormData()
  formData.append('image', imagePreview.file)

  try {
    const res = await fetch('http://localhost:4000/api/upload', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (data.success) {
      onSendMessage(data.url, 'image')
      setImagePreview(null)
    }
  } catch(e) {
    console.error('Ошибка загрузки фото', e)
  }
}

  const isOnline = onlineUsers.includes(currentChat)

  if (!currentChat) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}>💬</span>
        <h2 style={styles.emptyTitle}>Добро пожаловать в GI Chat!</h2>
        <p style={styles.emptySub}>Выбери пользователя чтобы начать общение</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>

      {/* Шапка */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <span style={styles.avatar}>👤</span>
          <div>
            <h3 style={styles.chatName}>{currentChat}</h3>
            <span style={{
              ...styles.status,
              color: isOnline ? '#4caf50' : '#888'
            }}>
              {isOnline ? 'онлайн' : 'оффлайн'}
            </span>
          </div>
        </div>
      </div>

      {/* Сообщения */}
      <div style={styles.messages}>
        {messages
          .filter(m =>
            (m.from === user.username && m.to === currentChat) ||
            (m.from === currentChat && m.to === user.username)
          )
          .map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              isSent={msg.from === user.username}
            />
          ))
        }
        <div ref={messagesEndRef} />
      </div>

      {/* Печатает */}
      {typingUser === currentChat && (
        <div style={styles.typing}>печатает...</div>
      )}

      {/* Поле ввода */}
      <div style={styles.inputArea}>
  {showEmoji && (
    <div style={styles.emojiPicker}>
      <EmojiPicker
        theme="dark"
        onEmojiClick={(e) => {
          setText(prev => prev + e.emoji)
          setShowEmoji(false)
        }}
      />
    </div>
  )}
  {imagePreview && (
  <div style={styles.previewContainer}>
    <img src={imagePreview.url} alt="превью" style={styles.previewImage} />
    <div style={styles.previewButtons}>
      <button style={styles.btnSendImage} onClick={sendImage}>Отправить ➤</button>
      <button style={styles.btnCancelImage} onClick={() => setImagePreview(null)}>Отмена ✕</button>
    </div>
  </div>
)}
  <button style={styles.btnEmoji} onClick={() => setShowEmoji(!showEmoji)}>
    😊
  </button>
  <input
  type="file"
  accept="image/*"
  style={{ display: 'none' }}
  ref={fileRef}
  onChange={handleImageUpload}
/>
<button style={styles.btnEmoji} onClick={() => fileRef.current.click()}>
  🖼
</button>
  <input
    style={styles.input}
    placeholder="Написать сообщение..."
    value={text}
    onChange={handleTyping}
    onKeyPress={handleKey}
  />
  <button style={styles.btnSend} onClick={handleSend}>➤</button>
</div>

    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#0f0f0f',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    color: '#444',
  },
  emptyIcon: {
    fontSize: '60px',
  },
  emptyTitle: {
    fontSize: '22px',
    color: '#666',
  },
  emptySub: {
    fontSize: '14px',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #2a2a2a',
    background: '#141414',
  },
  headerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    fontSize: '28px',
    background: '#2a2a2a',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatName: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
  },
  status: {
    fontSize: '12px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  typing: {
    padding: '8px 20px',
    fontSize: '12px',
    color: '#6c63ff',
    fontStyle: 'italic',
  },
  inputArea: {
    padding: '16px 20px',
    borderTop: '1px solid #2a2a2a',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    background: '#141414',
    position: 'relative',
  },
  input: {
    flex: 1,
    padding: '12px 18px',
    borderRadius: '24px',
    border: '1px solid #2a2a2a',
    background: '#1a1a1a',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
  },
  btnSend: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiPicker: {
  position: 'absolute',
  bottom: '80px',
  left: '20px',
  zIndex: 100,
},
btnEmoji: {
  fontSize: '22px',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
},
previewContainer: {
  position: 'absolute',
  bottom: '80px',
  left: '20px',
  background: '#1e1e1e',
  borderRadius: '16px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  zIndex: 100,
  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
},
previewImage: {
  maxWidth: '250px',
  maxHeight: '200px',
  borderRadius: '12px',
  objectFit: 'cover',
},
previewButtons: {
  display: 'flex',
  gap: '8px',
},
btnSendImage: {
  flex: 1,
  padding: '8px',
  borderRadius: '10px',
  border: 'none',
  background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
  color: 'white',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '13px',
},
btnCancelImage: {
  padding: '8px 12px',
  borderRadius: '10px',
  border: '1px solid #444',
  background: 'transparent',
  color: '#888',
  cursor: 'pointer',
  fontSize: '13px',
}
}