const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SECRET = 'gichat_secret_key_2026'
const users = []

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.json({ success: false, message: 'Заполни все поля!' })
    if (password.length < 6) return res.json({ success: false, message: 'Пароль минимум 6 символов!' })
    const exists = users.find(u => u.username === username)
    if (exists) return res.json({ success: false, message: 'Имя занято!' })
    const hash = await bcrypt.hash(password, 10)
    users.push({ username, password: hash, avatar: '👤', online: false })
    const token = jwt.sign({ username }, SECRET)
    res.json({ success: true, token, username })
  } catch (e) {
    res.json({ success: false, message: 'Ошибка!' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.json({ success: false, message: 'Заполни все поля!' })
    const user = users.find(u => u.username === username)
    if (!user) return res.json({ success: false, message: 'Пользователь не найден!' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.json({ success: false, message: 'Неверный пароль!' })
    const token = jwt.sign({ username }, SECRET)
    res.json({ success: true, token, username })
  } catch (e) {
    res.json({ success: false, message: 'Ошибка!' })
  }
})

router.post('/phone-login', async (req, res) => {
  try {
    const { username, phone } = req.body
    if (!username || !phone) return res.json({ success: false, message: 'Заполни все поля!' })
    let user = users.find(u => u.phone === phone)
    if (!user) {
      users.push({ username, phone, avatar: '👤', online: false })
      user = users[users.length - 1]
    }
    const token = jwt.sign({ username, phone }, SECRET)
    res.json({ success: true, token, username })
  } catch (e) {
    res.json({ success: false, message: 'Ошибка!' })
  }
})

router.get('/users', (req, res) => {
  const safeUsers = users.map(u => ({ username: u.username, avatar: u.avatar, online: u.online }))
  res.json({ success: true, users: safeUsers })
})

module.exports = { router, users }