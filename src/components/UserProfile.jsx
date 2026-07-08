import { useState } from 'react'
import useStore from '../store/useStore'

export default function UserProfile({ username, onClose }) {
  const { user, blockedUsers, addBlock, removeBlock } = useStore()
  const isBlocked = blockedUsers.includes(username)
  const [loading, setLoading] = useState(false)

  const toggleBlock = async () => {
    setLoading(true)
    try {
      const endpoint = isBlocked ? 'unblock' : 'block'
      const res = await fetch(`https://gi-chat-production.up.railway.app/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocker: user.username, blocked: username })
      })
      const data = await res.json()
      if (data.success) {
        isBlocked ? removeBlock(username) : addBlock(username)
      }
    } catch(e) {}
    setLoading(false)
  }

  const getColor = (name) => {
    const colors = ['#6c63ff', '#ff6584', '#43b89c', '#f7b731', '#fc5c65', '#45aaf2']
    return colors[name.charCodeAt(0) % colors.length]
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        
        <button style={styles.btnClose} onClick={onClose}>✕</button>

        <div style={{ ...styles.avatar, background: getColor(username) }}>
          {username.slice(0, 2).toUpperCase()}
        </div>

        <h2 style={styles.username}>{username}</h2>

        <div style={styles.buttons}>
          <button
            style={{
              ...styles.btnBlock,
              background: isBlocked ? '#2a2a2a' : 'transparent',
              borderColor: isBlocked ? '#4caf50' : '#ff4444',
              color: isBlocked ? '#4caf50' : '#ff4444',
            }}
            onClick={toggleBlock}
            disabled={loading}
          >
            {loading ? '...' : isBlocked ? '✅ Разблокировать' : '🚫 Заблокировать'}
          </button>
        </div>

      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#141414',
    borderRadius: '20px',
    padding: '32px 24px',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid #2a2a2a',
    position: 'relative',
  },
  btnClose: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '18px',
    cursor: 'pointer',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
  },
  username: {
    color: 'white',
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
  },
  buttons: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
  },
  btnBlock: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid',
    background: 'transparent',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  }
}