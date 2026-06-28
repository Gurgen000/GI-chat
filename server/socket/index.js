const messages = []
const groups = []

module.exports = (io) => {
  const onlineUsers = {}

  io.on('connection', (socket) => {

    socket.on('user_online', (username) => {
      onlineUsers[username] = socket.id
      socket.username = username
      io.emit('online_users', Object.keys(onlineUsers))
    })

    // Личное сообщение
    socket.on('private_message', ({ to, text, from, type }) => {
      const msg = { from, to, text, type: type || 'text', createdAt: new Date() }
      messages.push(msg)
      const recipientSocket = onlineUsers[to]
      if (recipientSocket) io.to(recipientSocket).emit('private_message', msg)
      socket.emit('private_message', msg)
    })

    // История личных сообщений
    socket.on('get_history', ({ user1, user2 }) => {
      const history = messages.filter(m =>
        (m.from === user1 && m.to === user2) ||
        (m.from === user2 && m.to === user1)
      )
      socket.emit('history', history)
    })

    // Создать группу
    socket.on('create_group', ({ name, members, creator }) => {
      const group = {
        id: Date.now().toString(),
        name,
        members: [...members, creator],
        creator,
        createdAt: new Date(),
        messages: []
      }
      groups.push(group)
      
      // Присоединяем всех участников к комнате
      group.members.forEach(member => {
        const memberSocket = onlineUsers[member]
        if (memberSocket) {
          io.to(memberSocket).emit('group_created', group)
        }
      })
    })

    // Получить группы пользователя
    socket.on('get_groups', (username) => {
      const userGroups = groups.filter(g => g.members.includes(username))
      socket.emit('groups', userGroups)
    })

    // Групповое сообщение
    socket.on('group_message', ({ groupId, text, from, type }) => {
      const group = groups.find(g => g.id === groupId)
      if (!group) return

      const msg = { groupId, from, text, type: type || 'text', createdAt: new Date() }
      group.messages.push(msg)

      // Отправляем всем участникам группы
      group.members.forEach(member => {
        const memberSocket = onlineUsers[member]
        if (memberSocket) {
          io.to(memberSocket).emit('group_message', msg)
        }
      })
    })

    // История группы
    socket.on('get_group_history', (groupId) => {
      const group = groups.find(g => g.id === groupId)
      socket.emit('group_history', group ? group.messages : [])
    })

    // Печатает
    socket.on('typing', ({ to, from }) => {
      const recipientSocket = onlineUsers[to]
      if (recipientSocket) io.to(recipientSocket).emit('typing', { from })
    })

    socket.on('stop_typing', ({ to, from }) => {
      const recipientSocket = onlineUsers[to]
      if (recipientSocket) io.to(recipientSocket).emit('stop_typing', { from })
    })

    socket.on('disconnect', () => {
      if (socket.username) {
        delete onlineUsers[socket.username]
        io.emit('online_users', Object.keys(onlineUsers))
      }
    })
  })
}