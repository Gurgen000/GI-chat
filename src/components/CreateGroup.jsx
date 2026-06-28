import { useState } from 'react'
import useStore from '../store/useStore'

export default function CreateGroup({ onClose, onCreateGroup }) {
  const { users } = useStore()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState([])

  const toggleUser = (username) => {
    setSelected(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : [...prev, username]
    )
  }

  const handleCreate = () => {
    if (!name.trim()) return
    if (selected.length === 0) return
    onCreateGroup(name.trim(), selected)
    onClose()
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>👥 Создать группу</h3>

        <input
          style={styles.input}
          placeholder="Название группы..."
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <p style={styles.label}>Выбери участников:</p>

        <div style={styles.usersList}>
          {users.map(u => (
            <div
              key={u.username}
              style={{
                ...styles.userItem,
                background: selected.includes(u.username) ? '#1e1e2e' : 'transparent',
                border: selected.includes(u.username) ? '1px solid #6c63ff' : '1px solid #2a2a2a'
              }}
              onClick={() => toggleUser(u.username)}
            >
              <span>👤</span>
              <span style={styles.username}>{u.username}</span>
              {selected.includes(u.username) && <span style={styles.check}>✓</span>}
            </div>
          ))}
        </div>

        <div style={styles.buttons}>
          <button style={styles.btnCancel} onClick={onClose}>Отмена</button>
          <button
            style={{
              ...styles.btnCreate,
              opacity: !name.trim() || selected.length === 0 ? 0.5 : 1
            }}
            onClick={handleCreate}
            disabled={!name.trim() || selected.length === 0}
          >
            Создать
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
  },
  modal: {
    background: '#1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  title: {
    color: 'white',
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #2a2a2a',
    background: '#0f0f0f',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
  },
  label: {
    color: '#888',
    fontSize: '13px',
    margin: 0,
  },
  usersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  userItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  username: {
    flex: 1,
    color: 'white',
    fontSize: '14px',
  },
  check: {
    color: '#6c63ff',
    fontWeight: '700',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
  },
  btnCancel: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #2a2a2a',
    background: 'transparent',
    color: '#888',
    cursor: 'pointer',
    fontSize: '14px',
  },
  btnCreate: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  }
}