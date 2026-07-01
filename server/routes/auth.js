const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Message = require('../models/Message')

const SECRET = 'gichat_secret_key_2026'

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.json({ success: false, message: 'Заполни все поля!' })
    if (password.length < 6) return res.json({ success: false, message: 'Пароль минимум 6 символов!' })

    const exists = await User.findOne({ username })
    if (exists) return res.json({ success: false, message: 'Имя занято!' })

    const hash = await bcrypt.hash(password, 10)
    const user = new User({ username, password: hash })
    await user.save()

    const token = jwt.sign({ username }, SECRET)
    res.json({ success: true, token, username })
  } catch (e) {
    res.json({ success: false, message: 'Ошибка!' })
  }
})

// Вход
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.json({ success: false, message: 'Заполни все поля!' })

    const user = await User.findOne({ username })
    if (!user) return res.json({ success: false, message: 'Пользователь не найден!' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.json({ success: false, message: 'Неверный пароль!' })

    const token = jwt.sign({ username }, SECRET)
    res.json({ success: true, token, username })
  } catch (e) {
    res.json({ success: false, message: 'Ошибка!' })
  }
})

// Получить всех пользователей
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username avatar online')
    res.json({ success: true, users })
  } catch (e) {
    res.json({ success: false, message: 'Ошибка!' })
  }
})

router.delete('/delete', async (req, res) => {
  try {
    const { username } = req.body
    await User.deleteOne({ username })
    await Message.deleteMany({ $or: [{ from: username }, { to: username }] })
    res.json({ success: true })
  } catch(e) {
    res.json({ success: false })
  }
})

module.exports = { router }