const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /auth/login
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Login', error: null });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('auth/login', { title: 'Login', error: 'All fields are required.' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { title: 'Login', error: 'Invalid email or password.' });
    }
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/dashboard');
  } catch (err) {
    res.render('auth/login', { title: 'Login', error: 'Something went wrong. Try again.' });
  }
});

// GET /auth/signup
router.get('/signup', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/signup', { title: 'Sign Up', error: null });
});

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.render('auth/signup', { title: 'Sign Up', error: 'All fields are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.render('auth/signup', { title: 'Sign Up', error: 'Email already registered.' });
    }
    const user = new User({ name, email, password, role: role || 'member' });
    await user.save();
    req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/dashboard');
  } catch (err) {
     console.error(err);
    res.render('auth/signup', { title: 'Sign Up', error: 'Something went wrong. Try again.' });
  }
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;
