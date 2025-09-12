// routes/expenses.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Expense = require('../models/Expense');
const User = require('../models/User');
const router = express.Router();

// Middleware to protect routes
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

// GET /api/expenses/all
router.get('/all', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    const user = await User.findById(req.user.id).select('-passHash');
    res.json({ expenses, budget: user.budget });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST /api/expenses
router.post('/', auth, async (req, res) => {
  const { amount, category, desc, date, remind } = req.body;
  try {
    const newExpense = new Expense({ user: req.user.id, amount, category, desc, date, remind });
    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    if (expense.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// PUT /api/expenses/budget
router.put('/budget', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.budget = req.body.budget;
        await user.save();
        res.json({ budget: user.budget });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;