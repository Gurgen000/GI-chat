import { useState } from 'react'
import useStore from '../store/useStore'

export default function Auth() {
  const [tab, setTab] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useStore()

  const handleSubmit = async () => {
    if (!username || !password) { setError('Заполни все поля!'); return }
    if (password.length < 6) { setError('Пароль минимум 6 символов!'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`https://gi-chat-production.up.railway.app/api/auth/${tab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.success) {
        setUser({ username: data.username }, data.token)
        localStorage.setItem('username', data.username)
        localStorage.setItem('token', data.token)
      } else {
        setError(data.message)
      }
    } catch(e) {
      setError('Ошибка подключения!')
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>💬</span>
          <h1 style={styles.logoText}>GI Chat</h1>
          <p style={styles.logoSub}>Общайся свободно</p>
        </div>

        <div style={styles.tabs}>
          <button style={{ ...styles.tab, ...(tab === 'login' ? styles.tabActive : {}) }}
            onClick={() => { setTab('login'); setError('') }}>Войти</button>
          <button style={{ ...styles.tab, ...(tab === 'register' ? styles.tabActive : {}) }}
            onClick={() => { setTab('register'); setError('') }}>Регистрация</button>
        </div>

        <input style={styles.input} placeholder="Имя пользователя"
          value={username} onChange={e => setUsername(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSubmit()} />
        <input style={styles.input} type="password" placeholder="Пароль"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSubmit()} />

        {error && <p style={styles.error}>{error}</p>}

        <button style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f0f' },
  box: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '340px' },
  logo: { textAlign: 'center', marginBottom: '10px' },
  logoIcon: { fontSize: '60px' },
  logoText: { fontSize: '36px', fontWeight: '700', background: 'linear-gradient(135deg, #6c63ff, #ff6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoSub: { color: '#888', fontSize: '14px', marginTop: '5px' },
  tabs: { display: 'flex', gap: '8px', background: '#1a1a1a', padding: '5px', borderRadius: '12px', width: '100%' },
  tab: { flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: 'transparent', color: '#888', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  tabActive: { background: '#6c63ff', color: 'white' },
  input: { width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: 'white', fontSize: '14px', outline: 'none' },
  error: { color: '#ff6584', fontSize: '13px', textAlign: 'center' },
  btnPrimary: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6c63ff, #ff6584)', color: 'white', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
}