const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  category: { type: String, required: true },
  promptText: { type: String, required: true },
  boilerplateCode: { type: String, required: true },
  testCases: [testCaseSchema],
  asciiArt: { type: String, required: true } // Multi-line escaped string for UI rendering
});

module.exports = mongoose.model('Problem', problemSchema);