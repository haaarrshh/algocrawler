const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  totalXP: { type: Number, default: 0 },
  systemCredits: { type: Number, default: 0 }, // New: Currency for the shop
  maxHP: { type: Number, default: 100 }         // New: Scalable health
});

module.exports = mongoose.model('User', userSchema);