const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const path = require('path')
const multer = require('multer')

const { router: authRoutes } = require('./routes/auth')
const socketHandler = require('./socket/index')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())

// Отдаём загруженные файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Настройка загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Только картинки!'))
    }
  }
})

// Роут загрузки фото
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.json({ success: false, message: 'Файл не загружен!' })
  const url = `http://localhost:4000/uploads/${req.file.filename}`
  res.json({ success: true, url })
})

app.use('/api/auth', authRoutes)
socketHandler(io)

server.listen(4000, () => {
  console.log('🚀 GI Chat сервер запущен на порту 4000!')
})