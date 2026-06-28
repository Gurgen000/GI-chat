export default function Message({ msg, isSent }) {
  const time = new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const isImage = msg.type === 'image' || msg.text?.startsWith('http://localhost:4000/uploads/')

  return (
    <div style={{
      ...styles.container,
      alignSelf: isSent ? 'flex-end' : 'flex-start',
    }}>
      <div style={{
        ...styles.bubble,
        background: isSent
          ? 'linear-gradient(135deg, #6c63ff, #ff6584)'
          : '#1e1e1e',
        borderBottomRightRadius: isSent ? '4px' : '16px',
        borderBottomLeftRadius: isSent ? '16px' : '4px',
        padding: isImage ? '6px' : '10px 14px',
      }}>
        {isImage ? (
          <img
            src={msg.text}
            alt="фото"
            style={styles.image}
            onClick={() => window.open(msg.text, '_blank')}
          />
        ) : (
          <p style={styles.text}>{msg.text}</p>
        )}
        <span style={styles.time}>{time}</span>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    maxWidth: '65%',
  },
  bubble: {
    borderRadius: '16px',
  },
  text: {
    fontSize: '14px',
    color: 'white',
    lineHeight: '1.5',
    margin: 0,
  },
  image: {
    maxWidth: '250px',
    maxHeight: '300px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'block',
  },
  time: {
    fontSize: '10px',
    opacity: '0.6',
    display: 'block',
    textAlign: 'right',
    marginTop: '4px',
    color: 'white',
    padding: '0 4px 2px',
  }
}