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

// Prefer serving the Frontend folder as the site root so paths behave like Live Server.
const ROOT_DIR = path.join(__dirname, '..', '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'Frontend');

// Serve model assets at /models (models are in project-root models/)
app.use('/models', express.static(path.join(ROOT_DIR, 'models')));

// Serve the Frontend directory as the web root (so / -> Frontend/index.html, /style.css -> Frontend/style.css)
app.use(express.static(FRONTEND_DIR));

// Fallback: also serve other static files from project root if needed
app.use(express.static(ROOT_DIR));

const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// Return user by id (used by frontend to fetch authoritative age from DB)
app.get('/api/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ ok: false, error: 'Missing id' });
    const [rows] = await pool.execute('SELECT id, email, name, age FROM users WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ ok: false, error: 'User not found' });
    return res.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
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

// Submit quiz attempt
app.post('/api/quiz/attempt', async (req, res) => {
  try {
    const { 
      user_id, 
      quiz_type, 
      total_questions, 
      correct_answers, 
      time_taken_seconds, 
      difficulty_level = 'medium',
      answers_data,
      ip_address,
      user_agent 
    } = req.body || {};

    // Validation
    if (!user_id || !quiz_type || total_questions === undefined || correct_answers === undefined) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    // Calculate score percentage
    const score_percentage = total_questions > 0 ? (correct_answers / total_questions) * 100 : 0;

    // Get next attempt number for this user and quiz type
    const [attemptRows] = await pool.execute(
      'SELECT MAX(attempt_number) as max_attempt FROM quiz_attempts WHERE user_id = ? AND quiz_type = ?',
      [user_id, quiz_type]
    );
    const attempt_number = (attemptRows[0]?.max_attempt || 0) + 1;

    // Insert quiz attempt
    const [result] = await pool.execute(`
      INSERT INTO quiz_attempts 
      (user_id, quiz_type, total_questions, correct_answers, score_percentage, 
       time_taken_seconds, difficulty_level, attempt_number, answers_data, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user_id, quiz_type, total_questions, correct_answers, score_percentage,
      time_taken_seconds, difficulty_level, attempt_number, 
      answers_data ? JSON.stringify(answers_data) : null, ip_address, user_agent
    ]);

    // Update user stats
    await updateUserStats(user_id, total_questions, correct_answers, score_percentage, time_taken_seconds);

    return res.json({ 
      ok: true, 
      attempt_id: result.insertId,
      attempt_number,
      score_percentage: parseFloat(score_percentage.toFixed(2))
    });
  } catch (err) {
    console.error('Quiz attempt error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get user's quiz history
app.get('/api/user/:id/quiz-history', async (req, res) => {
  try {
    const userId = req.params.id;
    const { quiz_type, limit = 10, offset = 0 } = req.query;

    if (!userId) return res.status(400).json({ ok: false, error: 'Missing user ID' });

    let query = `
      SELECT id, quiz_type, total_questions, correct_answers, score_percentage,
             time_taken_seconds, difficulty_level, attempt_number, quiz_date
      FROM quiz_attempts 
      WHERE user_id = ?
    `;
    let params = [userId];

    if (quiz_type) {
      query += ' AND quiz_type = ?';
      params.push(quiz_type);
    }

    query += ' ORDER BY quiz_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.execute(query, params);
    return res.json({ ok: true, attempts: rows });
  } catch (err) {
    console.error('Quiz history error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get user statistics
app.get('/api/user/:id/stats', async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ ok: false, error: 'Missing user ID' });

    const [statsRows] = await pool.execute('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
    
    // Get recent attempts summary
    const [recentRows] = await pool.execute(`
      SELECT quiz_type, COUNT(*) as total_attempts, 
             AVG(score_percentage) as avg_score, 
             MAX(score_percentage) as best_score,
             MAX(quiz_date) as last_attempt
      FROM quiz_attempts 
      WHERE user_id = ? 
      GROUP BY quiz_type
    `, [userId]);

    return res.json({ 
      ok: true, 
      stats: statsRows[0] || null,
      quiz_summary: recentRows
    });
  } catch (err) {
    console.error('User stats error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get user's attempt count for specific quiz type
app.get('/api/user/:id/attempt-count/:quizType', async (req, res) => {
  try {
    const userId = req.params.id;
    const quizType = req.params.quizType;
    
    if (!userId || !quizType) {
      return res.status(400).json({ ok: false, error: 'Missing user ID or quiz type' });
    }

    const [rows] = await pool.execute(
      'SELECT COUNT(*) as attempt_count FROM quiz_attempts WHERE user_id = ? AND quiz_type = ?',
      [userId, quizType]
    );

    const attemptCount = rows[0]?.attempt_count || 0;
    return res.json({ 
      ok: true, 
      attempt_count: attemptCount,
      next_attempt: attemptCount + 1
    });
  } catch (err) {
    console.error('Attempt count error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Helper function to update user statistics
async function updateUserStats(userId, totalQuestions, correctAnswers, scorePercentage, timeTakenSeconds) {
  try {
    // Check if user stats exist
    const [existing] = await pool.execute('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
    
    if (existing.length === 0) {
      // Create new stats record
      await pool.execute(`
        INSERT INTO user_stats (user_id, total_attempts, total_questions_answered, 
                               total_correct_answers, average_score, best_score, 
                               last_quiz_date, total_time_spent_seconds)
        VALUES (?, 1, ?, ?, ?, ?, NOW(), ?)
      `, [userId, totalQuestions, correctAnswers, scorePercentage, scorePercentage, timeTakenSeconds || 0]);
    } else {
      // Update existing stats
      const stats = existing[0];
      const newTotalAttempts = stats.total_attempts + 1;
      const newTotalQuestions = stats.total_questions_answered + totalQuestions;
      const newTotalCorrect = stats.total_correct_answers + correctAnswers;
      const newAverageScore = (stats.total_correct_answers + correctAnswers) / newTotalQuestions * 100;
      const newBestScore = Math.max(stats.best_score, scorePercentage);
      const newTotalTime = stats.total_time_spent_seconds + (timeTakenSeconds || 0);

      await pool.execute(`
        UPDATE user_stats 
        SET total_attempts = ?, total_questions_answered = ?, total_correct_answers = ?,
            average_score = ?, best_score = ?, last_quiz_date = NOW(), 
            total_time_spent_seconds = ?
        WHERE user_id = ?
      `, [newTotalAttempts, newTotalQuestions, newTotalCorrect, newAverageScore, 
          newBestScore, newTotalTime, userId]);
    }
  } catch (err) {
    console.error('Update user stats error:', err);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
