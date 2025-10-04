require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Remove any unexpected Content-Security-Policy header that may block DevTools requests
app.use((req, res, next) => {
  try { res.removeHeader('Content-Security-Policy'); } catch (e) { /* ignore */ }
  next();
});

// Serve frontend static files from project root (so visiting http://localhost:3000/ serves index.html)
app.use(express.static(path.join(__dirname, '..', '..')));

const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { email, name, age, password } = req.body || {};
    if (!email || !name || !age || !password) {
      return res.status(400).json({ ok: false, error: 'Missing fields' });
    }

    // simple validation
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters' });
    }

    // check existing
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows && rows.length > 0) {
      return res.status(409).json({ ok: false, error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (email, password, name, age) VALUES (?, ?, ?, ?)',
      [email, hash, name, age]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing fields' });

    const [rows] = await pool.execute('SELECT id, email, password, name, age FROM users WHERE email = ?', [email]);
    if (!rows || rows.length === 0) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

    // For now we return basic user info (no JWT). For production, issue a token.
    return res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, age: user.age } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
