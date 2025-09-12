// models/Expense.js
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  desc: { type: String },
  date: { type: String, required: true },
  remind: { type: Boolean, default: false },
});

module.exports = mongoose.model('Expense', ExpenseSchema);