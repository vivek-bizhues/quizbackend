const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
  question: String,
  selectedOption: String,
});

module.exports = mongoose.model('Response', responseSchema);