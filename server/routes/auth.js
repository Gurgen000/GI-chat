const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");

const SECRET = "gichat_secret_key_2026";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.json({ success: false, message: "Нет токена!" });
    const decoded = jwt.verify(token, SECRET);
    req.username = decoded.username; // берём username из токена!
    next();
  } catch (e) {
    res.json({ success: false, message: "Неверный токен!" });
  }
};

// Регистрация
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.json({ success: false, message: "Заполни все поля!" });
    if (password.length < 6)
      return res.json({
        success: false,
        message: "Пароль минимум 6 символов!",
      });

    const exists = await User.findOne({ username });
    if (exists) return res.json({ success: false, message: "Имя занято!" });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();

    const token = jwt.sign({ username }, SECRET);
    res.json({ success: true, token, username });
  } catch (e) {
    res.json({ success: false, message: "Ошибка!" });
  }
});

// Вход
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.json({ success: false, message: "Заполни все поля!" });
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ success: false, message: "Пользователь не найден!" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({ success: false, message: "Неверный пароль!" });
    const token = jwt.sign({ username }, SECRET);
    res.json({ success: true, token, username, hasSeed: !!user.seedHash });
  } catch (e) {
    res.json({ success: false, message: "Ошибка!" });
  }
});

// Получить всех пользователей
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "username avatar online");
    res.json({ success: true, users });
  } catch (e) {
    res.json({ success: false, message: "Ошибка!" });
  }
});

router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    await User.deleteOne({ username: req.username });
    await Message.deleteMany({
      $or: [{ from: req.username }, { to: req.username }],
    });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

const Block = require("../models/Block");

// Заблокировать пользователя
router.post("/block", authMiddleware, async (req, res) => {
  try {
    const { blocked } = req.body;
    const exists = await Block.findOne({ blocker: req.username, blocked });
    if (exists)
      return res.json({ success: false, message: "Уже заблокирован!" });
    await new Block({ blocker: req.username, blocked }).save();
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

// Разблокировать
router.post("/unblock", authMiddleware, async (req, res) => {
  try {
    const { blocked } = req.body;
    await Block.deleteOne({ blocker: req.username, blocked });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

// Проверить заблокирован ли
router.get("/blocks/:username", async (req, res) => {
  try {
    const blocks = await Block.find({ blocker: req.params.username });
    res.json({ success: true, blocks: blocks.map((b) => b.blocked) });
  } catch (e) {
    res.json({ success: false, blocks: [] });
  }
});

// Удалить одно сообщение
router.delete("/message/:id", async (req, res) => {
  try {
    await Message.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

// Удалить весь чат
router.delete("/chat", async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    await Message.deleteMany({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

// Сохранить хэш сид-фразы
router.post("/save-seed-hash", authMiddleware, async (req, res) => {
  try {
    const { publicIdentifier } = req.body;
    if (!publicIdentifier) {
      return res.json({ success: false, message: "Нет данных!" });
    }
    const hashed = await bcrypt.hash(publicIdentifier, 12);
    // Берём username из токена — не из req.body!
    await User.findOneAndUpdate(
      { username: req.username },
      { seedHash: hashed },
    );
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

// Проверить сид-фразу (для восстановления доступа)
router.post("/verify-seed", async (req, res) => {
  try {
    const { publicIdentifier, username } = req.body;
    const user = await User.findOne({ username });
    if (!user || !user.seedHash) {
      return res.json({ success: false, message: "Сид-фраза не найдена!" });
    }
    const isValid = await bcrypt.compare(publicIdentifier, user.seedHash);
    res.json({ success: isValid });
  } catch (e) {
    res.json({ success: false });
  }
});

module.exports = { router };
