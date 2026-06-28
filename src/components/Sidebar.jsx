import { useState } from 'react'
import useStore from '../store/useStore'
import UserItem from './UserItem'
import CreateGroup from './CreateGroup'

export default function Sidebar({ onOpenChat, onOpenGroup, onCreateGroup, onLogout }) {
  const { user, users, onlineUsers, currentChat, currentGroup, groups } = useStore()
  const [search, setSearch] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [tab, setTab] = useState('chats') // chats | groups

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.container}>

      {/* Шапка */}
      <div style={styles.header}>
        <div style={styles.profile}>
          <span style={styles.avatar}>👤</span>
          <span style={styles.username}>{user?.username}</span>
        </div>
        <button style={styles.btnLogout} onClick={onLogout}>Выйти</button>
      </div>

      {/* Поиск */}
      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Табы */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(tab === 'chats' ? styles.tabActive : {}) }}
          onClick={() => setTab('chats')}
        >
          💬 Чаты
        </button>
        <button
          style={{ ...styles.tab, ...(tab === 'groups' ? styles.tabActive : {}) }}
          onClick={() => setTab('groups')}
        >
          👥 Группы
        </button>
      </div>

      {/* Список */}
      <div style={styles.list}>
        {tab === 'chats' && (
          <>
            {filteredUsers.length === 0 && (
              <p style={styles.empty}>Нет пользователей</p>
            )}
            {filteredUsers.map(u => (
              <UserItem
                key={u.username}
                user={u}
                isOnline={onlineUsers.includes(u.username)}
                isActive={currentChat === u.username}
                onClick={() => onOpenChat(u.username)}
              />
            ))}
          </>
        )}

        {tab === 'groups' && (
          <>
            <button style={styles.btnNewGroup} onClick={() => setShowCreateGroup(true)}>
              + Создать группу
            </button>
            {filteredGroups.length === 0 && (
              <p style={styles.empty}>Нет групп</p>
            )}
            {filteredGroups.map(g => (
              <div
                key={g.id}
                style={{
                  ...styles.groupItem,
                  background: currentGroup?.id === g.id ? '#1e1e2e' : 'transparent'
                }}
                onClick={() => onOpenGroup(g)}
              >
                <span style={styles.groupIcon}>👥</span>
                <div style={styles.groupInfo}>
                  <div style={styles.groupName}>{g.name}</div>
                  <div style={styles.groupMembers}>{g.members.length} участников</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showCreateGroup && (
        <CreateGroup
          onClose={() => setShowCreateGroup(false)}
          onCreateGroup={onCreateGroup}
        />
      )}

    </div>
  )
}

const styles = {
  container: {
    width: '300px',
    background: '#141414',
    borderRight: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #2a2a2a',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    fontSize: '28px',
    background: '#2a2a2a',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontWeight: '600',
    color: 'white',
    fontSize: '14px',
  },
  btnLogout: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid #2a2a2a',
    background: 'transparent',
    color: '#888',
    cursor: 'pointer',
    fontSize: '12px',
  },
  searchBox: {
    padding: '12px 16px',
    borderBottom: '1px solid #2a2a2a',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #2a2a2a',
    background: '#1a1a1a',
    color: 'white',
    fontSize: '13px',
    outline: 'none',
  },
  tabs: {
    display: 'flex',
    padding: '8px',
    gap: '6px',
    borderBottom: '1px solid #2a2a2a',
  },
  tab: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '10px',
    background: 'transparent',
    color: '#888',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  tabActive: {
    background: '#1e1e2e',
    color: 'white',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },
  empty: {
    textAlign: 'center',
    color: '#444',
    padding: '20px',
    fontSize: '13px',
  },
  btnNewGroup: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px dashed #2a2a2a',
    background: 'transparent',
    color: '#6c63ff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  groupItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  groupIcon: {
    fontSize: '28px',
    background: '#2a2a2a',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontWeight: '500',
    fontSize: '14px',
    color: 'white',
  },
  groupMembers: {
    fontSize: '12px',
    color: '#888',
    marginTop: '2px',
  }
}