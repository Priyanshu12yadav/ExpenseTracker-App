// routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// POST /api/users/register
router.post('/register', async (req, res) => {
  const { first, last, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(password, salt);
    user = new User({ first, last, email, passHash });
    await user.save();
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account with this email.' });
    }
    const isMatch = await bcrypt.compare(password, user.passHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password.' });
    }
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ ok: true, token, user: { first: user.first, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;