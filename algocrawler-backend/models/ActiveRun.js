const mongoose = require('mongoose');

const activeRunSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentFloor: { type: Number, default: 1 },
  currentHP: { type: Number, required: true },
  inventory: [{ type: String }],
  mapSeed: { type: String, required: true } // Used to generate the deterministic path
});

module.exports = mongoose.model('ActiveRun', activeRunSchema);