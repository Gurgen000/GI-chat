import { useEffect } from 'react'
import useStore from './store/useStore'
import Auth from './pages/Auth'
import Chat from './pages/Chat'

function App() {
  const { user, setUser } = useStore()

useEffect(() => {
  const username = localStorage.getItem('username')
  const token = localStorage.getItem('token')
  if (username && token) {
    setUser({ username }, token)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {user ? <Chat /> : <Auth />}
    </div>
  )
}

export default App