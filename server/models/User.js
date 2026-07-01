const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '👤' },
  online: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', UserSchema)