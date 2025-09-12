// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  first: { type: String, required: true },
  last: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passHash: { type: String, required: true },
  budget: { type: Number, default: 20000 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);