-- Run this SQL to create the users table in your MySQL database (use mysql CLI or a DB client)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) DEFAULT NULL,
  age INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table to track user quiz attempts and scores
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_type VARCHAR(100) NOT NULL, -- e.g., 'focus_test', 'attention_quiz', 'memory_test'
  total_questions INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  score_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  time_taken_seconds INT DEFAULT NULL, -- time taken to complete the quiz
  difficulty_level VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  attempt_number INT NOT NULL, -- which attempt this is for the user
  quiz_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answers_data JSON DEFAULT NULL, -- store detailed answers for analysis
  ip_address VARCHAR(45) DEFAULT NULL, -- for tracking purposes
  user_agent TEXT DEFAULT NULL, -- browser/device info
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes for better performance
  INDEX idx_user_id (user_id),
  INDEX idx_quiz_type (quiz_type),
  INDEX idx_quiz_date (quiz_date),
  INDEX idx_user_quiz (user_id, quiz_type),
  INDEX idx_score (score_percentage)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table to track user progress and statistics
CREATE TABLE IF NOT EXISTS user_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  total_attempts INT DEFAULT 0,
  total_questions_answered INT DEFAULT 0,
  total_correct_answers INT DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0.00,
  best_score DECIMAL(5,2) DEFAULT 0.00,
  last_quiz_date TIMESTAMP NULL,
  streak_days INT DEFAULT 0, -- consecutive days of taking quizzes
  total_time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Index for better performance
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;