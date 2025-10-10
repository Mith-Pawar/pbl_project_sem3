const questions = [
  { 
    question: "How many words are in this sentence?:    Read this sentence once before you answer", answer: "9", time: 10 
},
  {
     question: "What comes next: 2,4,6,8,?", answer: "10", time: 20 
    },
  { 
    question: "Spell the word 'FOCUS' backwards", answer: "SUCOF", time: 20 
},
  {
     question: "If 5+3=8, then 8-3=?", answer: "5", time: 20 },
  {
    question: "What is the 3rd letter in 'CONCENTRATION'?",
    answer: "N",
    time: 20,
  },
  {
    question: "15 ÷ 3 × (2 + 1) = ?",
    answer: "15",
    time: 20,
  },
 {
    question:"If John is taller than Sam and Sam is taller than Tim, who is the shortest?", answer:"Tim", time:30
},
  {
     question: "If TWO=3 and THREE=9, what is TWO+FOUR?", answer: "12", time: 20 
    },
  {
     question: "How many vowels in 'CONCENTRATION'?", answer: "5", time: 30
     },
  {
    question: "Read carefully: Write the 2nd word of this question",
    answer: "carefully",
    time: 30,
  },
];
let current = 0,
  score = 0,
  timerInt,
  timeLeft,
  responses = [];
const qEl = document.getElementById("question"),
  ansEl = document.getElementById("answer"),
  timerEl = document.getElementById("timer"),
  qNo = document.getElementById("qNo"),
  progress = document.getElementById("progress"),
  results = document.getElementById("results"),
  showAnswersBtn = document.getElementById("showAnswersBtn"),
  modal = document.getElementById("modal"),
  allAnswers = document.getElementById("allAnswers"),
  closeModal = document.getElementById("closeModal");
function startQuiz() {
  current = 0;
  score = 0;
  responses = [];
  results.style.display = "none";
  ansEl.style.display = "block";
  document.querySelector(".controls").style.display = "flex";
  timerEl.style.display = "inline-block";
  showAnswersBtn.style.display = "none";
  document.getElementById("restartBtn").style.display = "none";
  showQuestion();
}
function showQuestion() {
  if (current >= questions.length) {
    showResult();
    return;
  }
  const q = questions[current];
  qEl.textContent = q.question;
  qNo.textContent = current + 1;
  ansEl.value = "";
  timeLeft = q.time;
  progress.style.width = `${(current / questions.length) * 100}%`;
  updateTimer();
  startTimer();
}
function startTimer() {
  clearInterval(timerInt);
  timerInt = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInt);
      checkAnswer(true);
    }
  }, 1000);
}
function updateTimer() {
  timerEl.textContent = timeLeft + "s";
}
function checkAnswer(auto = false) {
  const q = questions[current];
  const userAns = ansEl.value.trim();
  responses.push({
    question: q.question,
    user: userAns || "<em>Skipped</em>",
    correct: q.answer,
    isCorrect: !auto && userAns.toLowerCase() === q.answer.toLowerCase(),
  });
  if (!auto && userAns.toLowerCase() === q.answer.toLowerCase()) score++;
  current++;
  clearInterval(timerInt);
  showQuestion();
}
function showResult() {
  qEl.textContent = "Quiz Completed!";
  ansEl.style.display = "none";
  document.querySelector(".controls").style.display = "none";
  timerEl.style.display = "none";
  progress.style.width = "100%";
  results.style.display = "block";
  results.innerHTML = `<div class='row'><span>Total Score:</span><span class='tag ${
    score > 7 ? "good" : "bad"
  }'>${score}/10</span></div>`;
  showAnswersBtn.style.display = "inline-block";
  document.getElementById("restartBtn").style.display = "block";
}
showAnswersBtn.onclick = () => {
  allAnswers.innerHTML = "";
  responses.forEach((r) => {
    const div = document.createElement("div");
    div.className = "answer-row " + (r.isCorrect ? "correct" : "wrong");
    div.innerHTML = `<span><strong>Q:</strong> ${r.question}</span><span><strong>Your:</strong> ${r.user}</span><span><strong>Correct:</strong> ${r.correct}</span>`;
    allAnswers.appendChild(div);
  });
  modal.style.display = "flex";
};
closeModal.onclick = () => {
  modal.style.display = "none";
};
document.getElementById("nextBtn").onclick = () => checkAnswer();
document.getElementById("skipBtn").onclick = () => checkAnswer(true);
document.getElementById("restartBtn").onclick = () => startQuiz();
startQuiz();
