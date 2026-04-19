const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  totalXP: { type: Number, default: 0 },
  systemCredits: { type: Number, default: 0 }, 
  maxHP: { type: Number, default: 100 }         
});

module.exports = mongoose.model('User', userSchema);