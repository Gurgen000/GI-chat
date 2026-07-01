const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String },
  groupId: { type: String },
  text: { type: String, required: true },
  type: { type: String, default: 'text' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Message', MessageSchema)