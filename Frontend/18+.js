// 18+ Focus Test with Dynamic Question Sets Based on Attempts
// Include quiz utilities and question sets
// Add these script tags to 18+.html: 
// <script src="quiz-utils.js"></script>
// <script src="18plus-questions.js"></script>

// Quiz start time for tracking
let quizStartTime = Date.now();

// Global variables
let questions = [];
let current = 0;
let score = 0;
let responses = [];
let timerInt;
let timeLeft;
let currentAttempt = 1;
let isLoggedIn = false;
let selectedAnswer = null;

// DOM elements
const qEl = document.getElementById('question');
const ansEl = document.getElementById('answer');
const timerEl = document.getElementById('timer');
const progress = document.getElementById('progress');
const results = document.getElementById('results');
const showAnswersBtn = document.getElementById('showAnswersBtn');
const allAnswers = document.getElementById('allAnswers');
const qNo = document.getElementById('qNo');
const optionsContainer = document.getElementById('options-container');
const optionsEl = document.getElementById('options');

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', async function() {
  await loadQuiz();
});

async function loadQuiz() {
  try {
    // Show loading message
    qEl.textContent = 'Loading quiz...';
    
    // Initialize quiz with appropriate questions based on attempt
    const quizData = await initialize18PlusQuiz('focus_test_18+');
    
    questions = quizData.questions;
    currentAttempt = quizData.attemptNumber;
    isLoggedIn = quizData.isLoggedIn;
    
    if (questions.length === 0) {
      qEl.textContent = 'Error loading questions. Please refresh the page.';
      return;
    }
    
    // Show attempt information
    if (isLoggedIn) {
      console.log(`Starting attempt ${currentAttempt} with ${questions.length} questions`);
    } else {
      console.log('User not logged in - using default questions');
    }
    
    // Start the quiz
    showQuestion();
  } catch (error) {
    console.error('Error loading quiz:', error);
    qEl.textContent = 'Error loading quiz. Please refresh the page.';
  }
}

function showQuestion() {
  if (current >= questions.length) {
    showResult();
    return;
  }
  
  const q = questions[current];
  qNo.textContent = current + 1;
  qEl.textContent = q.question;
  
  // Reset selected answer
  selectedAnswer = null;
  
  // Clear previous options
  optionsEl.innerHTML = '';
  
  // Check if question has options (multiple choice)
  if (q.options && q.options.length > 0) {
    // Show multiple choice options
    ansEl.style.display = 'none';
    optionsContainer.style.display = 'block';
    
    // Create option buttons
    q.options.forEach((option, index) => {
      const optionBtn = document.createElement('button');
      optionBtn.className = 'option-btn';
      optionBtn.textContent = option;
      optionBtn.onclick = () => selectOption(option, optionBtn);
      optionsEl.appendChild(optionBtn);
    });
  } else {
    // Show text input for questions without options
    optionsContainer.style.display = 'none';
    ansEl.style.display = 'block';
    ansEl.value = '';
    ansEl.focus();
    
    // Add Enter key support for text input
    ansEl.onkeypress = (e) => {
      if (e.key === 'Enter') {
        checkAnswer();
      }
    };
  }
  
  // Update progress
  progress.style.width = ((current + 1) / questions.length) * 100 + '%';
  
  // Set timer
  timeLeft = q.time;
  timerEl.textContent = timeLeft + 's';
  
  // Start timer
  clearInterval(timerInt);
  timerInt = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft + 's';
    if (timeLeft <= 0) {
      checkAnswer(true); // Auto-submit when time runs out
    }
  }, 1000);
  
  // Show controls
  document.querySelector('.controls').style.display = 'block';
  results.style.display = 'none';
  showAnswersBtn.style.display = 'none';
  document.querySelector('.footer-buttons').style.display = 'none';
  
  // Set initial state for Next button
  const nextBtn = document.getElementById('nextBtn');
  if (q.options && q.options.length > 0) {
    // For multiple choice, disable Next button until option is selected
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.5';
  } else {
    // For text input, enable Next button
    nextBtn.disabled = false;
    nextBtn.style.opacity = '1';
  }
}

function updateTimer() {
  timerEl.textContent = timeLeft + 's';
}

function selectOption(option, button) {
  // Remove previous selection
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Add selection to clicked button
  button.classList.add('selected');
  selectedAnswer = option;
  
  // Enable next button
  document.getElementById('nextBtn').disabled = false;
  document.getElementById('nextBtn').style.opacity = '1';
}

function checkAnswer(auto = false, option = null) {
  const q = questions[current];
  let userAns;
  
  // Determine user answer based on question type
  if (q.options && q.options.length > 0) {
    // Multiple choice question
    userAns = auto ? null : selectedAnswer;
  } else {
    // Text input question
    userAns = option || ansEl.value.trim();
  }
  
  // Check if answer is correct
  const isCorrect = !auto && userAns && userAns.toLowerCase() === q.answer.toLowerCase();
  
  responses.push({
    question: q.question,
    user: userAns || '<em>Skipped</em>',
    correct: q.answer,
    isCorrect: isCorrect,
    questionType: q.options ? 'multiple_choice' : 'text_input'
  });
  
  if (isCorrect) {
    score++;
  }
  
  current++;
  clearInterval(timerInt);
  showQuestion();
}

async function showResult() {
  qEl.textContent = 'Quiz Completed!';
  ansEl.style.display = 'none';
  optionsContainer.style.display = 'none';
  document.querySelector('.controls').style.display = 'none';
  timerEl.style.display = 'none';
  progress.style.width = '100%';
  results.style.display = 'block';
  
  // Show attempt information in results
  const attemptInfo = isLoggedIn ? ` (Attempt ${currentAttempt})` : ' (Not logged in)';
  results.innerHTML = `
    <div class='row'>
      <span class='Total_Score'>Total Score:</span>
      <span class='tag ${score > 7 ? 'good' : 'bad'}'>${score}/${questions.length}</span>
    </div>
    <div class='attempt-info' style='margin-top: 10px; color: #666; font-size: 14px;'>
      ${attemptInfo}
    </div>
  `;
  
  showAnswersBtn.style.display = 'inline-block';
  document.querySelector('.footer-buttons').style.display = 'block';
  
  // Submit quiz attempt to backend
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id) {
    const timeTaken = calculateTimeTaken(quizStartTime);
    const quizData = {
      user_id: currentUser.id,
      quiz_type: 'focus_test_18+',
      total_questions: questions.length,
      correct_answers: score,
      time_taken_seconds: timeTaken,
      difficulty_level: currentAttempt === 1 ? 'hard' : currentAttempt === 2 ? 'medium' : 'hard',
      responses: responses
    };
    
    const result = await submitQuizAttempt(quizData);
    showSubmissionResult(result, score, questions.length);
  } else {
    console.log('User not logged in - quiz results not saved');
    // Show message that user needs to login to save results
    const loginMsg = document.createElement('div');
    loginMsg.innerHTML = `
      <div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 5px; margin: 10px 0;">
        ⚠️ Please login to save your quiz results and track your progress!
      </div>
    `;
    const resultsEl = document.querySelector('.results');
    if (resultsEl && resultsEl.parentNode) {
      resultsEl.parentNode.insertBefore(loginMsg, resultsEl.nextSibling);
    }
  }
}

// Show answers functionality
showAnswersBtn.onclick = () => {
  allAnswers.innerHTML = '';
  responses.forEach(r => {
    const div = document.createElement('div');
    div.className = 'answer-row ' + (r.isCorrect ? 'correct' : 'wrong');
    
    let userAnswerDisplay = r.user;
    if (r.user === '<em>Skipped</em>') {
      userAnswerDisplay = '<em style="color: #fbbf24;">Skipped</em>';
    }
    
    div.innerHTML = `
      <div class="question">${r.question}</div>
      <div class="answers">
        <div class="user-answer ${r.isCorrect ? 'correct' : 'wrong'}">
          <strong>Your answer:</strong> ${userAnswerDisplay}
        </div>
        <div class="correct-answer">
          <strong>Correct answer:</strong> ${r.correct}
        </div>
        ${r.questionType === 'multiple_choice' ? '<div class="question-type">Type: Multiple Choice</div>' : '<div class="question-type">Type: Text Input</div>'}
      </div>
    `;
    allAnswers.appendChild(div);
  });
  
  document.getElementById('modal').style.display = 'block';
};

// Close modal functionality
document.getElementById('closeModal').onclick = () => {
  document.getElementById('modal').onclick = (e) => {
    if (e.target === document.getElementById('modal')) {
      document.getElementById('modal').style.display = 'none';
    }
  };
};

// Button event listeners
document.getElementById('nextBtn').onclick = () => checkAnswer();
document.getElementById('skipBtn').onclick = () => checkAnswer(true);

// Restart functionality
document.getElementById('restartBtn').onclick = () => {
  current = 0;
  score = 0;
  responses = [];
  quizStartTime = Date.now();
  showQuestion();
};

// Home button functionality
document.getElementById('homeBtn').onclick = () => {
  window.location.href = 'index.html';
};