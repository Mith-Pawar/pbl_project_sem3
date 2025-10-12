// Utility functions for quiz attempts and backend communication

/**
 * Submit quiz attempt to backend
 * @param {Object} quizData - Quiz attempt data
 * @param {number} quizData.user_id - User ID
 * @param {string} quizData.quiz_type - Type of quiz (e.g., 'focus_test_8_12', 'focus_test_13_18', 'focus_test_18+')
 * @param {number} quizData.total_questions - Total number of questions
 * @param {number} quizData.correct_answers - Number of correct answers
 * @param {number} quizData.time_taken_seconds - Time taken to complete quiz
 * @param {string} quizData.difficulty_level - Difficulty level
 * @param {Array} quizData.responses - Array of question responses
 */
async function submitQuizAttempt(quizData) {
  try {
    console.log('Submitting quiz attempt:', quizData);
    
    const response = await fetch('/api/quiz/attempt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: quizData.user_id,
        quiz_type: quizData.quiz_type,
        total_questions: quizData.total_questions,
        correct_answers: quizData.correct_answers,
        time_taken_seconds: quizData.time_taken_seconds,
        difficulty_level: quizData.difficulty_level || 'medium',
        answers_data: quizData.responses,
        ip_address: null, // Will be filled by backend
        user_agent: navigator.userAgent
      })
    });

    const result = await response.json();
    
    if (response.ok && result.ok) {
      console.log('✅ Quiz attempt submitted successfully:', result);
      return {
        success: true,
        attempt_id: result.attempt_id,
        attempt_number: result.attempt_number,
        score_percentage: result.score_percentage
      };
    } else {
      console.error('❌ Failed to submit quiz attempt:', result.error);
      return {
        success: false,
        error: result.error || 'Failed to submit quiz attempt'
      };
    }
  } catch (error) {
    console.error('❌ Error submitting quiz attempt:', error);
    return {
      success: false,
      error: 'Network error while submitting quiz attempt'
    };
  }
}

/**
 * Get current logged-in user from localStorage
 */
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
}

/**
 * Calculate time taken for quiz
 * @param {number} startTime - Start time in milliseconds
 */
function calculateTimeTaken(startTime) {
  return Math.floor((Date.now() - startTime) / 1000);
}

/**
 * Show quiz submission result to user
 * @param {Object} result - Result from submitQuizAttempt
 * @param {number} score - User's score
 * @param {number} totalQuestions - Total questions
 */
function showSubmissionResult(result, score, totalQuestions) {
  const scorePercentage = Math.round((score / totalQuestions) * 100);
  
  if (result.success) {
    // Show success message             <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0;">
    const successMsg = document.createElement('div');
    successMsg.className = 'quiz-submission-success';
    successMsg.innerHTML = `
      <div style="background: #transparent; color:rgb(30, 223, 75); padding: 10px; border-radius: 5px; margin: 10px 0;">
        ✅ Quiz submitted successfully! 
        <br>Score: ${score}/${totalQuestions} (${scorePercentage}%)
        <br>Attempt #${result.attempt_number}
      </div>
    `;
    
    // Insert after results element
    const resultsEl = document.querySelector('.results');
    if (resultsEl && resultsEl.parentNode) {
      resultsEl.parentNode.insertBefore(successMsg, resultsEl.nextSibling);
    }
  } else {
    // Show error message
    const errorMsg = document.createElement('div');
    errorMsg.className = 'quiz-submission-error';
    errorMsg.innerHTML = `
      <div style="background: #transparent; color:rgb(188, 52, 65); padding: 10px; border-radius: 5px; margin: 10px 0;">
        ❌ Failed to save quiz results: ${result.error}
        <br>Your score: ${score}/${totalQuestions} (${scorePercentage}%)
      </div>
    `;
    
    // Insert after results element
    const resultsEl = document.querySelector('.results');
    if (resultsEl && resultsEl.parentNode) {
      resultsEl.parentNode.insertBefore(errorMsg, resultsEl.nextSibling);
    }
  }
}

// Export functions for use in other files
window.submitQuizAttempt = submitQuizAttempt;
window.getCurrentUser = getCurrentUser;
window.calculateTimeTaken = calculateTimeTaken;
window.showSubmissionResult = showSubmissionResult;
