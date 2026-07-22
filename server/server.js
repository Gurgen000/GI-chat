require("dotenv").config();
const rateLimit = require("express-rate-limit");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");

const { router: authRoutes } = require("./routes/auth");
const socketHandler = require("./socket/index");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors({
  origin: [
    'https://gi-chat-rho.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json());
// Rate limiting для авторизации
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // максимум 10 попыток
  message: {
    success: false,
    message: "Слишком много попыток! Попробуй через 15 минут.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting для всех запросов
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 минута
  max: 100, // максимум 100 запросов
  message: { success: false, message: "Слишком много запросов!" },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", generalLimiter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Загрузка файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Только картинки!"));
  },
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file)
    return res.json({ success: false, message: "Файл не загружен!" });
  res.json({
    success: true,
    url: `http://localhost:4000/uploads/${req.file.filename}`,
  });
});

app.use("/api/auth", authRoutes);
socketHandler(io);

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB подключена!"))
  .catch((e) => console.log("❌ Ошибка MongoDB:", e));

server.listen(4000, () => {
  console.log("🚀 GI Chat сервер запущен на порту 4000!");
});
