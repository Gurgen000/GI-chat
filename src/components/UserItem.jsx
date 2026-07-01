import useStore from '../store/useStore'

export default function UserItem({ user, isOnline, isActive, onClick, getColor, getInitials }) {
  const unread = useStore((state) => state.unread[user.username] || 0)

  return (
    <div
      style={{
        ...styles.container,
        background: isActive ? '#1e1e2e' : 'transparent'
      }}
      onClick={onClick}
    >
      <div style={styles.avatarContainer}>
        <div style={{
          ...styles.avatar,
          background: getColor ? getColor(user.username) : '#6c63ff'
        }}>
          {getInitials ? getInitials(user.username) : user.username.slice(0, 2).toUpperCase()}
        </div>
        {isOnline && <div style={styles.onlineDot} />}
      </div>
      <div style={styles.info}>
        <div style={styles.name}>{user.username}</div>
        <div style={{ ...styles.status, color: isOnline ? '#4caf50' : '#888' }}>
          {isOnline ? 'онлайн' : 'оффлайн'}
        </div>
      </div>
      {unread > 0 && (
        <div style={styles.badge}>{unread}</div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
  },
  onlineDot: {
    width: '10px',
    height: '10px',
    background: '#4caf50',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '0',
    right: '0',
    border: '2px solid #141414',
  },
  info: { flex: 1 },
  name: { fontWeight: '500', fontSize: '14px', color: 'white' },
  status: { fontSize: '12px', marginTop: '2px' },
  badge: {
    background: 'linear-gradient(135deg, #6c63ff, #ff6584)',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '700',
  }
}